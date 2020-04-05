import { fromEvent } from 'rxjs';
import { filter, map, auditTime, tap } from 'rxjs/operators';
import { Message } from '@model/worker.model';
import {
  MessageFromLevelParent,
  ToggleLevelTile,
  ToggleLevelWall,
  LevelWorkerContext,
  UpdateLevelMeta,
  DuplicateLevelMeta,
  RemoveLevelMeta,
} from '@model/level/level.worker.model';
import { Rect2 } from '@model/rect2.model';
import { Poly2 } from '@model/poly2.model';
import { redact, removeFromLookup } from '@model/redux.model';
import { testNever } from '@model/generic.model';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { Act } from '@store/level/level.duck';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { getLevel, store } from './create-store';
import { tileDim, smallTileDim, floorInset, navTags, rebuildTags, doorOutset } from '@model/level/level-params';
import { sendMetas } from './handle-requests';
import { updateNavGraph, getDoorRects } from './handle-nav';

const ctxt: LevelWorkerContext = self as any;
const dispatch = store.dispatch as LevelDispatchOverload;

/**
 * Handle tile/wall toggling for specified level.
 */
export function handleLevelToggles(levelUid: string) {
  return fromEvent<Message<MessageFromLevelParent>>(ctxt, 'message')
    .pipe(
      map(({ data }) => data),
      filter((msg): msg is ToggleLevelTile | ToggleLevelWall => {
        if (msg.levelUid !== levelUid) return false;
        return  (
          msg.key === 'toggle-level-tile'
          || msg.key === 'toggle-level-wall'
        );
      }),
      map((msg) => {
        let { tileFloors, wallSeg } = getLevel(levelUid)!;

        switch (msg.key) {
          case 'toggle-level-tile': {
            const td = msg.tileSize === 'large' ? tileDim : smallTileDim;
            const rect = new Rect2(msg.tile.x, msg.tile.y, td, td);
            tileFloors = Poly2.xor(tileFloors, rect.poly2).map(x => redact(x));
            /**
             * The outer polygons `tileFloors` can self-intersect at corners, so we
             * must use the fast triangulator. These polys are used by `updateLights`.
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

        dispatch(Act.updateLevel(levelUid, { 
          floydWarshall: null,
          tileFloors,
          wallSeg,
        }));

        computeInternalWalls(levelUid);
        sendPreNavFloors(levelUid);

        updateLights(levelUid);
        computeNavFloors(levelUid);
        return null;
      }),
      auditTime(300),
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
      map((msg) => {
        const { metaGroups } = getLevel(levelUid)!;

        switch (msg.key) {
          case 'update-level-meta': {
            const { metaGroupKey, update } = msg;
            const group = metaGroups[metaGroupKey];
            const rebuildFloors = (
              update.key === 'add-tag' && (rebuildTags.includes(update.tag) || group.hasSomeTag(rebuildTags))
              || update.key === 'remove-tag' && (rebuildTags.includes(update.tag) || group.hasSomeTag(rebuildTags))
              || update.key === 'set-position' && group.hasSomeTag(rebuildTags)
            );
            const updateNav = (
              update.key === 'add-tag' && (navTags.includes(update.tag) || group.hasSomeTag(navTags))
              || update.key === 'remove-tag' && (navTags.includes(update.tag) || group.hasSomeTag(navTags))
              || update.key === 'set-position' && group.hasSomeTag(navTags)
            );
            group.applyUpdates(update);
            return { rebuildFloors, updateNav };
          }
          case 'duplicate-level-meta': {
            // Snap position to integers
            const [x, y] = [Math.round(msg.position.x), Math.round(msg.position.y)];
            const group = metaGroups[msg.metaGroupKey].clone(msg.newMetaGroupKey, Vector2.from({ x, y }));
            dispatch(Act.updateLevel(levelUid, { metaGroups: { ...metaGroups, [group.key]: group }}));
            return {
              rebuildFloors: group.hasSomeTag(rebuildTags),
              updateNav: group.hasSomeTag(navTags),
            };
          }
          case 'remove-level-meta': {
            const group = metaGroups[msg.metaGroupKey];
            if (msg.metaKey && group.metas.length > 1) {
              group.metas = group.metas.filter(({ key }) => key !== msg.metaKey);
              group.metaIndex = group.metaIndex ? group.metaIndex - 1 : 0;
            } else {
              dispatch(Act.updateLevel(msg.levelUid, { metaGroups: removeFromLookup(msg.metaGroupKey, metaGroups) }));
            }
            return {
              rebuildFloors: group.hasSomeTag(rebuildTags),
              updateNav: group.hasSomeTag(navTags),
            };
          }
          default: throw testNever(msg);
        }
      }),
      filter(({ rebuildFloors, updateNav }) => {

        updateLights(levelUid);
        sendMetas(levelUid);

        if (rebuildFloors) {
          computeInternalWalls(levelUid);
          sendPreNavFloors(levelUid);
          computeNavFloors(levelUid);
        }
        if (updateNav) {
          dispatch(Act.updateLevel(levelUid, { floydWarshall: null }));
        }
        return updateNav;
      }),
      auditTime(300),
      tap((_) => {
        updateNavGraph(levelUid);
      }),
    );
}

/**
 * Compute internal walls, taking doorways into account.
 * To use polygon operations we temp convert wall segs to thin rectangles.
 * We treat horiz/vert separately to avoid them being joined together.
 */
function computeInternalWalls(levelUid: string) {
  const { wallSeg } = getLevel(levelUid)!;
  const doorPolys = getDoorRects(levelUid).map(rect => rect.outset(doorOutset).poly2);

  const { hRects, vRects } = Object.values(wallSeg).reduce(
    (agg, [u, v]) => ({
      hRects: u.x === v.x ? agg.hRects
        : agg.hRects.concat(new Rect2(u.x, u.y, v.x - u.x, 0.01)),
      vRects: u.y === v.y ? agg.vRects
        : agg.vRects.concat(new Rect2(u.x, u.y, 0.01, v.y - u.y))
    }),
    { hRects: [] as Rect2[], vRects: [] as Rect2[] },
  );

  const hWalls = Poly2.cutOut(doorPolys, hRects.map(rect => rect.poly2))
    .map<[Vector2, Vector2]>(({ bounds }) => [bounds.topLeft, bounds.topRight]);
  const vWalls = Poly2.cutOut(doorPolys, vRects.map(rect => rect.poly2))
    .map<[Vector2, Vector2]>(({ bounds }) => [bounds.topLeft, bounds.bottomLeft]);

  dispatch(Act.updateLevel(levelUid, { innerWalls: hWalls.concat(vWalls) }));
}

function sendPreNavFloors(levelUid: string) {
  const { tileFloors, innerWalls } = getLevel(levelUid)!;
  ctxt.postMessage({
    key: 'send-level-layers',
    levelUid,
    tileFloors: tileFloors.map(({ json }) => json),
    wallSegs: innerWalls.map(([u, v]) => [u.json, v.json]),
  });
}

function computeNavFloors(levelUid: string) {
  const { tileFloors, wallSeg } = getLevel(levelUid)!;
  /**
   * Compute unnavigable areas induced by internal walls i.e.
   * 1. outset the walls (which are actually line segments).
   * 2. cut out any doorways specified via metas.
   */
  const outsetWalls = Poly2.cutOut(
    getDoorRects(levelUid).map(rect => rect.poly2),
    Object.values(wallSeg).map(([u, v]) =>
      new Rect2(u.x, u.y, v.x - u.x, v.y - u.y).outset(floorInset).poly2),
  );
  /**
   * The navigable area is obtained by:
   * 1. insetting `tileFloors` (accounts for external walls).
   * 2. cutting out `outsetWalls` (accounts for internal walls).
   */
  const navFloors = Poly2.cutOut(
    outsetWalls,
    tileFloors.flatMap(x => x.createInset(floorInset)),
  );
  
  dispatch(Act.updateLevel(levelUid, { floors: navFloors.map(x => redact(x)) }));
  ctxt.postMessage({
    key: 'send-level-nav-floors',
    levelUid,
    navFloors: navFloors.map(({ json }) => json),
  });
  return navFloors;
}

/**
 * We permit lights positioned on an external wall via slight outset.
 * However, we don't permit lights positioned on an internal wall.
 */
function updateLights(levelUid: string) {
  const { tileFloors, innerWalls, metaGroups: metas } = getLevel(levelUid)!;
  const outsetFloors = tileFloors.map(floor => floor.createOutset(0.01)[0]);
  const lineSegs = innerWalls.concat(outsetFloors.flatMap(x => x.lineSegs));
  
  Object.values(metas)
    .flatMap(({ metas }) => metas)
    .filter((meta) => meta.validateLight(outsetFloors, innerWalls))
    .forEach((meta) => meta.light!.computePolygon(lineSegs));
}

function edgeToKey(u: Vector2Json, v: Vector2Json) {
  return `${u.x},${u.y};${v.x},${v.y}`;
}
