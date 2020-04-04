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
import { sendMetas } from './handle-requests';
import { tileDim, smallTileDim, floorInset, navTags } from '@model/level/level-params';
import { updateNavGraph } from './handle-nav';

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
       * Compute navigable floor.
       */
      map((_) => {
        const { tileFloors, wallSeg } = getLevel(levelUid)!;

        const outsetWalls = Poly2.union(
          Object.values(wallSeg)
            .map(([u, v]) =>
              new Rect2(
                u.x - floorInset,
                u.y - floorInset,
                v.x - u.x + 2 * floorInset,
                v.y - u.y + 2 * floorInset
              ).poly2
            ).concat(
              // TODO block metas
            )
        );

        const navFloors = Poly2.cutOut(
          outsetWalls,
          tileFloors.flatMap(x => x.createInset(floorInset))
        );

        dispatch(Act.updateLevel(levelUid, {
          floors: navFloors.map(x => redact(x)),
        }));

        ctxt.postMessage({
          key: 'send-level-nav-floors',
          levelUid,
          navFloors: navFloors.map(({ json }) => json),
        });
        return navFloors;
      }),
      auditTime(300),
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
      // We'll return true iff should update nav
      map((msg) => {
        const { metaGroups } = getLevel(levelUid)!;

        switch (msg.key) {
          case 'update-level-meta': {
            const { metaGroupKey, update } = msg;
            // Mutate the meta groups
            metaGroups[metaGroupKey].applyUpdates(update);
            return (// Some updates can affect NavGraph
              update.key === 'add-tag'
                  && navTags.includes(update.tag)
              || update.key === 'remove-tag'
                  && navTags.includes(update.tag)
              || update.key === 'set-position'
                  && metaGroups[metaGroupKey].hasSomeTag(navTags)
              || update.key === 'ensure-meta-index' && false
            );
          }
          case 'duplicate-level-meta': {
            // Snap position to integers
            const [x, y] = [Math.round(msg.position.x), Math.round(msg.position.y)];
            const mg = metaGroups[msg.metaGroupKey].clone(msg.newMetaGroupKey, Vector2.from({ x, y }));
            dispatch(Act.updateLevel(levelUid, { metaGroups: { ...metaGroups, [mg.key]: mg }}));
            return mg.hasSomeTag(navTags);
          }
          case 'remove-level-meta': {
            const group = metaGroups[msg.metaGroupKey];
            if (msg.metaKey && group.metas.length > 1) {
              group.metas = group.metas.filter(({ key }) => key !== msg.metaKey);
              group.metaIndex = group.metaIndex ? group.metaIndex - 1 : 0;
            } else {
              dispatch(Act.updateLevel(msg.levelUid, { metaGroups: removeFromLookup(msg.metaGroupKey, metaGroups) }));
            }
            return group.hasSomeTag(navTags);
          }
          default: throw testNever(msg);
        }
      }),
      filter((updateNav) => {
        if (updateNav) {// Clear cached
          dispatch(Act.updateLevel(levelUid, { floydWarshall: null }));
        }
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
  const { tileFloors, wallSeg, metaGroups: metas } = getLevel(levelUid)!;
  
  // Permit lights positioned on an outer wall by slightly outsetting them
  const outsetFloors = tileFloors.map(floor => floor.createOutset(0.01)[0]);
  // However, we don't permit lights positioned on an internal wall
  const wallSegs = Object.values(wallSeg).map<[Vector2, Vector2]>(([u, v]) => [Vector2.from(u), Vector2.from(v)]);
  const lineSegs = wallSegs.concat(outsetFloors.flatMap(x => x.lineSegs));

  Object.values(metas)
    .flatMap(({ metas }) => metas)
    .filter((meta) => meta.validateLight(outsetFloors, wallSegs))
    .forEach((meta) => meta.light!.computePolygon(lineSegs));
}
