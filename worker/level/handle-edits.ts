import { fromEvent } from 'rxjs';
import { filter, map, delay, auditTime, tap } from 'rxjs/operators';
import { Message } from '@model/worker.model';
import { MessageFromLevelParent, ToggleLevelTile, ToggleLevelWall, LevelWorkerContext, UpdateLevelMeta, DuplicateLevelMeta, RemoveLevelMeta } from '@model/level/level.worker.model';
import { Rect2 } from '@model/rect2.model';
import { Poly2 } from '@model/poly2.model';
import { redact, removeFromLookup } from '@model/redux.model';
import { tileDim, smallTileDim, floorInset, navTags } from '@model/level/level.model';
import { testNever } from '@model/generic.model';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { Act } from '@store/level/level.duck';
import { Vector2 } from '@model/vec2.model';
import { getLevel, store } from './create-store';
import { sendLevelAux, sendMetas } from './handle-requests';

const ctxt: LevelWorkerContext = self as any;
const dispatch = store.dispatch as LevelDispatchOverload;

/**
 * Handle tile/wall toggling for specified level.
 */
export function handleLevelToggles(levelUid: string) {
  return fromEvent<Message<MessageFromLevelParent>>(ctxt, 'message')
    .pipe(
      map(({ data }) => data),
      filter((msg): msg is ToggleLevelTile | ToggleLevelWall =>
        msg.key === 'toggle-level-tile' && msg.levelUid === levelUid
        || msg.key === 'toggle-level-wall' && msg.levelUid === levelUid
      ),
      /**
       * Update tileFloors or walls.
       */
      map((msg) => {
        let { tileFloors, wallSeg } = getLevel(levelUid)!;
        switch (msg.key) {
          case 'toggle-level-tile': {
            const td = msg.type === 'large' ? tileDim : smallTileDim;
            const rect = new Rect2(msg.tile.x, msg.tile.y, td, td);
            tileFloors = Poly2.xor(tileFloors, rect.poly2).map(x => redact(x));
            // outer polygon can self-intersect and is used by updateLights
            tileFloors.forEach((p) => p.options.triangulationType = 'fast');
            break;
          }
          case 'toggle-level-wall': {
            wallSeg = { ...wallSeg };
            msg.segs.forEach(([u, v]) => {
              const key = `${u.x},${u.y};${v.x},${v.y}`;
              wallSeg[key] ? delete wallSeg[key] : wallSeg[key] = [u, v];
            });
            break;
          }
          default: throw testNever(msg);
        }
        // Clear cached
        dispatch(Act.updateLevel(levelUid, { floydWarshall: null }));

        dispatch(Act.updateLevel(levelUid, { tileFloors, wallSeg }));
        ctxt.postMessage({
          key: 'send-level-layers',
          levelUid,
          tileFloors: tileFloors.map(({ json }) => json),
          wallSegs: Object.values(wallSeg),
        });

        updateLights(levelUid); // Can do this early?
        return null;
      }),
      delay(20),
      /**
       * Update navigable floor.
       */
      map((_) => {
        const { tileFloors, wallSeg } = getLevel(levelUid)!;
        const outsetWalls = Poly2.union(Object.values(wallSeg).map(([u, v]) => new Rect2(
          u.x - floorInset, u.y - floorInset,
          v.x - u.x + 2 * floorInset, v.y - u.y + 2 * floorInset,
        ).poly2));
        const navFloors = Poly2.cutOut(outsetWalls, tileFloors.flatMap(x => x.createInset(floorInset)));

        dispatch(Act.updateLevel(levelUid, { floors: navFloors.map(x => redact(x)) }));
        ctxt.postMessage({
          key: 'send-level-nav-floors',
          levelUid,
          navFloors: navFloors.map(({ json }) => json),
        });
        return navFloors;
      }),
      auditTime(300),
      /**
       * Triangulate and construct NavGraph.
       */
      tap((_) => {
        updateNavGraph(levelUid);
      }),
    );
}

/**
 * Handle meta updates for specified level.
 */
export function handleMetaUpdates(levelUid: string) {
  return fromEvent<Message<MessageFromLevelParent>>(ctxt, 'message')
    .pipe(
      map(({ data }) => data),
      filter((msg): msg is UpdateLevelMeta | DuplicateLevelMeta | RemoveLevelMeta =>
        msg.key === 'update-level-meta' && levelUid === msg.levelUid
        || msg.key === 'duplicate-level-meta' && levelUid === msg.levelUid
        || msg.key === 'remove-level-meta' && levelUid === msg.levelUid
      ),
      map((msg) => {// Return true iff should update nav
        const { metas } = getLevel(levelUid)!;

        switch (msg.key) {
          case 'update-level-meta': {
            const { metaKey, update } = msg;
            metas[metaKey].applyUpdates(update); // Mutate
            return (
              // Some updates can affect NavGraph
              update.key === 'add-tag' && navTags.includes(update.tag)
              || update.key === 'remove-tag' && navTags.includes(update.tag)
              || update.key === 'set-position' && metas[metaKey].tags.some(tag => navTags.includes(tag))
            );
          }
          case 'duplicate-level-meta': {
            // Snap position to integers
            const [x, y] = [Math.round(msg.position.x), Math.round(msg.position.y)];
            const meta = metas[msg.metaKey].clone(msg.newMetaKey, Vector2.from({ x, y }));
            dispatch(Act.updateLevel(levelUid, { metas: { ...metas, [meta.key]: meta }}));
            return navTags.some(tag => meta.tags.includes(tag));
          }
          case 'remove-level-meta': {
            const nextMetas = removeFromLookup(msg.metaKey, metas);
            dispatch(Act.updateLevel(msg.levelUid, { metas: nextMetas }));
            return navTags.some(tag => metas[msg.metaKey].tags.includes(tag));
          }
          default: throw testNever(msg);
        }
      }),
      filter((updateNav) => {
        if (updateNav) {// Clear cached
          dispatch(Act.updateLevel(levelUid, { floydWarshall: null }));
        }
        // Currently we update lights immediately
        updateLights(levelUid);
        sendMetas(levelUid);
        return updateNav;
      }),
      auditTime(300),
      tap((_) => {
        updateNavGraph(levelUid);
      }),
    );
}

/**
 * Mutate the lights inside the store.
 */
function updateLights(levelUid: string) {
  const { tileFloors, wallSeg, metas } = getLevel(levelUid)!;
  const lineSegs = ([] as [Vector2, Vector2][]).concat(
    Object.values(wallSeg).map(([u, v]) => [Vector2.from(u), Vector2.from(v)]),
    tileFloors.flatMap(x => x.lineSegs),
  );
  Object.values(metas)
    .filter((meta) => meta.validateLight(tileFloors))
    .forEach((meta) => meta.light?.computePolygon(lineSegs));
}

/**
 * Update navigation i.e. triangulation
 */
function updateNavGraph(levelUid: string) {
  const { floors, metas } = getLevel(levelUid)!;
  floors.flatMap(x => x.removeSteiners().qualityTriangulate());

  // Valid steiner points will require a retriangulation
  const steiners = Object.values(metas)
    .filter(({ tags }) => tags.includes('steiner'))
    .reduce((agg, { position: p }) => {
      const index = floors.findIndex(floor => floor.contains(p));
      return index >= 0 ? { ...agg, [index]: (agg[index] || []).concat(p) } : agg;
    }, {} as Record<number, Vector2[]>);

  if (Object.keys(steiners).length) {// Retriangulate
    Object.entries(steiners).forEach(([index, ps]) => {
      floors[Number(index)].addSteinerPoints(ps).customTriangulate();
    });
  }

  ctxt.postMessage({
    key: 'send-level-tris',
    levelUid, 
    tris: floors.flatMap(x => x.triangulation).map(({ json }) => json),
  });

  // Clear ephemeral
  dispatch(Act.clearLevelAux(levelUid));
  sendLevelAux(levelUid);
  sendMetas(levelUid);
}
