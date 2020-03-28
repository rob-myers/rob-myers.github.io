import { fromEvent } from 'rxjs';
import { filter, map, delay, auditTime, tap } from 'rxjs/operators';
import { Message } from '@model/worker.model';
import { MessageFromLevelParent, ToggleLevelTile, ToggleLevelWall, LevelWorkerContext, UpdateLevelMeta, DuplicateLevelMeta, RemoveLevelMeta } from '@model/level/level.worker.model';
import { Rect2 } from '@model/rect2.model';
import { Poly2 } from '@model/poly2.model';
import { redact, removeFromLookup } from '@model/redux.model';
import { testNever } from '@model/generic.model';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { Act } from '@store/level/level.duck';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { getLevel, store } from './create-store';
import { sendLevelAux, sendMetas } from './handle-requests';
import { tileDim, smallTileDim, floorInset, navTags } from '@model/level/level-params';
import { NavGraph } from '@model/nav/nav-graph.model';

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
            const td = msg.tileSize === 'large' ? tileDim : smallTileDim;
            const rect = new Rect2(msg.tile.x, msg.tile.y, td, td);
            tileFloors = Poly2.xor(tileFloors, rect.poly2).map(x => redact(x));
            /**
             * The outer polygons `tileFloors` can self-intersect so we must
             * use the fast triangulator. These polygons are used by `updateLights`.
             */
            tileFloors.forEach((p) => p.options.triangulationType = 'fast');
            /**
             * If we removed a tile ensure any adjacent walls are removed too.
             */
            if (!tileFloors.some(f => f.contains(rect.center))) {
              const { x, y } = msg.tile;
              const indices = td === tileDim ? [1, 2, 3] : [1];
              [ ...indices.map((i) => edgeToKey({ x, y }, { x: x + i * smallTileDim, y })),
                ...indices.map((i) => edgeToKey({ x: x + td, y }, { x: x + td, y: y + i * smallTileDim })),
                ...indices.map((i) => edgeToKey({ x, y: y + td }, { x: x + i * smallTileDim, y: y + td })),
                ...indices.map((i) => edgeToKey({ x, y }, { x, y: y + i * smallTileDim })),
              ].forEach(key => delete wallSeg[key]);
            }
            break;
          }
          case 'toggle-level-wall': {
            wallSeg = { ...wallSeg };
            msg.segs.forEach(([u, v]) => {
              const key = edgeToKey(u, v);
              const mid = Vector2.from(u).add(v).scale(1/2);
              const norm = Vector2.from(v).sub(u).rotate(Math.PI/2).normalize();
              const [left, right] = [mid.clone().sub(norm), mid.clone().add(norm)];
              const hasLeftTile = tileFloors.some((f) => f.contains(left));
              const hasRightTile = tileFloors.some((f) => f.contains(right));

              if (msg.tileSize === 'large') {
                // For large tiles only toggle edges with both adjacent tiles
                if (hasLeftTile && hasRightTile) {
                  wallSeg[key] ? delete wallSeg[key] : wallSeg[key] = [u, v];
                }
              } else {
                if (hasLeftTile !== hasRightTile) {
                  /**
                   * If exactly one adjacent tile then wall already exists,
                   * so assume we're removing it. Also remove adjacent tile.
                   */
                  delete wallSeg[key]; // Ensure wall removed
                  const rect = hasLeftTile
                    ? Rect2.from(Vector2.from(u).sub(norm.clone().scale(smallTileDim)), Vector2.from(v))
                    : Rect2.from(Vector2.from(u).add(norm.clone().scale(smallTileDim)), Vector2.from(v));
                  tileFloors = Poly2.xor(tileFloors, rect.poly2).map(x => redact(x));
                } else if (!(hasLeftTile || hasRightTile)) {
                  /**
                   * No adjacent tiles so ensure removed,
                   * e.g. inverting large tile can leave hanging walls.
                   */
                  delete wallSeg[key];
                } else {
                  wallSeg[key] ? delete wallSeg[key] : wallSeg[key] = [u, v];
                }
              }

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

        updateLights(levelUid);
        return null;
      }),
      delay(20),
      /**
       * Update navigable floor.
       */
      map((_) => {
        const { tileFloors, wallSeg } = getLevel(levelUid)!;
        const outsetWalls = Poly2.union(Object.values(wallSeg).map(([u, v]) =>
          new Rect2(u.x - floorInset, u.y - floorInset, v.x - u.x + 2 * floorInset, v.y - u.y + 2 * floorInset).poly2));

        // Smaller inset so steiners 'on edge' are actually inside
        const navFloors = Poly2.cutOut(outsetWalls, tileFloors.flatMap(x => x.createInset(floorInset - 0.01)));
        // const navFloors = Poly2.cutOut(outsetWalls, tileFloors.flatMap(x => x.createInset(floorInset)));

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

function edgeToKey(u: Vector2Json, v: Vector2Json) {
  return `${u.x},${u.y};${v.x},${v.y}`;
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

  /**
   * OLD APPROACH
   */
  // Remove steiners and then triangulate
  floors.flatMap(x => x.removeSteiners().qualityTriangulate());
  // Valid steiner points will require a retriangulation
  const nonSteiners = floors.flatMap(f => f.allPoints);
  const steiners = Object.values(metas)
    .filter(({ tags }) => tags.includes('steiner'))
    // // Duplicate vertices can break triangulator
    .filter(({ position }) => nonSteiners.every(p => !p.equals(position)))
    .reduce((agg, { position: p }) => {
      const index = floors.findIndex(floor => floor.contains(p));
      return index >= 0 ? { ...agg, [index]: (agg[index] || []).concat(p) } : agg;
    }, {} as Record<number, Vector2[]>);

  if (Object.keys(steiners).length) {// Retriangulate with steiners
    Object.entries(steiners).forEach(([index, ps]) => {
      floors[Number(index)].addSteinerPoints(ps).customTriangulate();
    });
  }
  ctxt.postMessage({
    key: 'send-level-tris',
    levelUid, 
    tris: floors.flatMap(x => x.triangulation).map(({ json }) => json),
  });

  /**
   * NEW APPROACH
   */
  const navRectGraph = redact(NavGraph.from(floors));
  dispatch(Act.updateLevel(levelUid, { navGraph: navRectGraph }));
  // console.log({ navRectGraph });
  ctxt.postMessage({
    key: 'send-level-nav-rects',
    levelUid,
    rects: navRectGraph.rects.map(r => r.json),
  });

  // Clear ephemeral
  dispatch(Act.clearLevelAux(levelUid));
  sendLevelAux(levelUid);
  sendMetas(levelUid);
}
