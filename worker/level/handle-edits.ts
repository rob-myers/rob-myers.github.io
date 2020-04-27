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
import { Vector2 } from '@model/vec2.model';
import { getLevel, store } from './create-store';
import { tileDim, floorInset, doorOutset, tableOutset, wallDepth } from '@model/level/level-params';
import { sendMetas, sendPreNavFloors } from './handle-requests';
import { updateNavGraph, getDoorRects, getHorizVertSegs, getCutRects, getTableRects } from './nav-utils';
import { isRebuildTag, isNavTag, navTags, rebuildTags } from '@model/level/level-meta.model';

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
        return  msg.key === 'toggle-level-tile' || msg.key === 'toggle-level-wall';
      }),
      map((msg) => {
        let { tileFloors, wallSeg } = getLevel(levelUid)!;

        switch (msg.key) {
          case 'toggle-level-tile': {
            const rect = new Rect2(msg.tile.x, msg.tile.y, tileDim, tileDim);
            tileFloors = Poly2.xor(tileFloors, rect.poly2).map(x => redact(x));
            /**
             * The outer polygons `tileFloors` can self-intersect at corners, so must
             * use the fast triangulator. These polys are used by `computeLights`.
             */
            tileFloors.forEach((p) => p.options.triangulationType = 'fast');
            break;
          }
          case 'toggle-level-wall': {
            wallSeg = { ...wallSeg };
            msg.segs.forEach(([u, v]) => {
              const key = `${u.x},${u.y};${v.x},${v.y}`;
              const mid = Vector2.from(u).add(v).scale(1/2);
              const norm = Vector2.from(v).sub(u).rotate(Math.PI/2).normalize();
              const [left, right] = [mid.clone().sub(norm), mid.clone().add(norm)];
              const hasLeftTile = tileFloors.some((f) => f.contains(left));
              const hasRightTile = tileFloors.some((f) => f.contains(right));

              if (hasLeftTile !== hasRightTile) {
                // Exactly one adjacent tile, so wall exists
                delete wallSeg[key]; // Ensure inner wall  removed
              } else if (!(hasLeftTile || hasRightTile)) {
                // No adjacent tiles, so ensure inner wall removed
                delete wallSeg[key];
              } else {// Two adjacent tiles, so toggle inner wall
                wallSeg[key] ? delete wallSeg[key] : wallSeg[key] = [u, v];
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

        computeTilesSansCuts(levelUid);
        computeInternalWalls(levelUid);
        sendPreNavFloors(levelUid);
        computeLights(levelUid);
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
            group.applyUpdates(update);

            if (update.key === 'move-to-back' || update.key === 'move-to-front') {
              delete metaGroups[metaGroupKey];
              dispatch(Act.updateLevel(levelUid, {
                metaGroups: update.key === 'move-to-back'
                  ? { [metaGroupKey]: group, ...metaGroups }
                  : { ...metaGroups, [metaGroupKey]: group }
              }));
            }

            return {
              rebuildFloors: (
                update.key === 'add-tag' && (isRebuildTag(update.tag) || group.hasSomeTag(rebuildTags))
                || update.key === 'remove-tag' && (isRebuildTag(update.tag) || group.hasSomeTag(rebuildTags))
                || update.key === 'set-position' && group.hasSomeTag(rebuildTags)
              ),
              updateNav: (
                update.key === 'add-tag' && (isNavTag(update.tag) || group.hasSomeTag(navTags))
                || update.key === 'remove-tag' && (isNavTag(update.tag) || group.hasSomeTag(navTags))
                || update.key === 'set-position' && group.hasSomeTag(navTags)
              ),
            };
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
        if (updateNav) {
          dispatch(Act.updateLevel(levelUid, { floydWarshall: null }));
        }
        if (rebuildFloors) {
          computeTilesSansCuts(levelUid);
          computeInternalWalls(levelUid);
          sendPreNavFloors(levelUid);
          computeNavFloors(levelUid);
        }
        computeLights(levelUid);
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
 * Remove rectangles from tiles, permitting e.g.
 * smaller rooms, central pillars, thin corridosr.
 */
function computeTilesSansCuts(levelUid: string) {
  const { tileFloors } = getLevel(levelUid)!;
  const tilesSansCuts = Poly2.cutOut(
    getCutRects(levelUid).map(rect => rect.poly2),
    tileFloors,
  ).map(x => redact(x));
  dispatch(Act.updateLevel(levelUid, { tilesSansCuts }));
}

/**
 * Compute internal walls, taking metas cut/door/horiz/vert into account.
 * To use polygonal operations we temp convert wall-segs to thin rectangles.
 * We treat horizontal/vertical separately to avoid them being joined together.
 */
function computeInternalWalls(levelUid: string) {
  const { wallSeg } = getLevel(levelUid)!;
  /** Wall segs from grid and horiz/vert metas */
  const wallSegs = Object.values(wallSeg).concat(getHorizVertSegs(levelUid));
  /** We'll cut out door metas (outset) and cut metas (not outset) */
  const cuttingPolys = getDoorRects(levelUid).map(rect => rect.outset(doorOutset).poly2)
    .concat(getCutRects(levelUid).map(rect => rect.poly2));

  const { hRects, vRects } = wallSegs.reduce(
    (agg, [u, v]) => ({
      hRects: u.x === v.x ? agg.hRects
        : agg.hRects.concat(new Rect2(u.x, u.y, v.x - u.x, 0.01)),
      vRects: u.y === v.y ? agg.vRects
        : agg.vRects.concat(new Rect2(u.x, u.y, 0.01, v.y - u.y))
    }),
    { hRects: [] as Rect2[], vRects: [] as Rect2[] },
  );

  const hWalls = Poly2.cutOut(cuttingPolys, hRects.map(rect => rect.poly2))
    .map<[Vector2, Vector2]>(({ bounds }) => [bounds.topLeft, bounds.topRight]);
  const vWalls = Poly2.cutOut(cuttingPolys, vRects.map(rect => rect.poly2))
    .map<[Vector2, Vector2]>(({ bounds }) => [bounds.topLeft, bounds.bottomLeft]);

  dispatch(Act.updateLevel(levelUid, { innerWalls: hWalls.concat(vWalls) }));
}

/**
 * Compute rendered `innerFloors` and navigable polygons `navFloors` using
 * tiles without cuts, internal walls (wallSeg/horiz/vert/door) and tables.
 */
function computeNavFloors(levelUid: string) {
  const { tilesSansCuts, wallSeg } = getLevel(levelUid)!;
  /**
   * Compute unnavigable areas induced by internal walls:
   * 1. outset the grid-based wall segments.
   * 2. cut out any doors specified via metas.
   */
  const innerWallSegs = Object.values(wallSeg).concat(getHorizVertSegs(levelUid));
  const outsetWalls = Poly2.cutOut(
    getDoorRects(levelUid).map(rect => rect.poly2),
    innerWallSegs.map(([u, v]) =>
      new Rect2(u.x, u.y, v.x - u.x, v.y - u.y).outset(floorInset).poly2),
  );
  /**
   * The rendered inner floors are obtained by:
   * 1. insetting `tileFloorsSansCuts` (accounts for external walls).
   * 2. cutting out `outsetWalls` (accounts for internal walls).
   */
  const innerFloors = Poly2.cutOut(outsetWalls,
    tilesSansCuts.flatMap(x => x.createInset(floorInset)),
  );
  ctxt.postMessage({ key: 'send-inner-floors', levelUid,
    navFloors: innerFloors.map(({ json }) => json),
  });
  /**
   * The navigable polygons are obtained from the innerFloors
   * by removing the outset tables.
   */
  const outsetTables = getTableRects(levelUid).map(rect => rect.outset(tableOutset).poly2);
  const navFloors = Poly2.cutOut(outsetTables, innerFloors);
  dispatch(Act.updateLevel(levelUid, { floors: navFloors.map(x => redact(x)) }));
  return navFloors;
}

function computeLights(levelUid: string) {
  const { tilesSansCuts, innerWalls, metaGroups: metas } = getLevel(levelUid)!;
  const insetFloors = tilesSansCuts.flatMap(floor => floor.createInset(wallDepth));

  /**
   * TODO there are defects at edges.
   * Instead, use rects of ViewGraph of 'viewable space'.
   */
  const innerWallSegs = innerWalls
    .map(([u, v]) => Rect2.from(u, v).outset(wallDepth))
    .flatMap(({ topLeft, topRight, bottomRight, bottomLeft }) => [
      [topRight, topLeft],
      [bottomRight, topRight],
      [bottomLeft, bottomRight],
      [topLeft, bottomLeft],
    ] as [Vector2, Vector2][]);
  const lineSegs = innerWallSegs.concat(insetFloors.flatMap(x => x.lineSegs));
  
  Object.values(metas)
    .flatMap(({ metas }) => metas)
    .filter((meta) => meta.validateLight(insetFloors, innerWalls))
    .forEach((meta) => meta.light!.computePolygon(lineSegs));
}
