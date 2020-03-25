/**
 * TODO needs a clean up and clarifying comments
 */
import { persistStore } from 'redux-persist';
import { fromEvent } from 'rxjs';
import { filter, map, delay, auditTime, tap } from 'rxjs/operators';

import { LevelWorkerContext, LevelWorker, MessageFromLevelParent, ToggleLevelTile, ToggleLevelWall, UpdateLevelMeta, DuplicateLevelMeta, RemoveLevelMeta } from '@model/level/level.worker.model';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { Act } from '@store/level/level.duck';
import { Message } from '@model/worker.model';
import { redact, removeFromLookup, addToLookup } from '@model/redux.model';
import { LevelState, floorInset, smallTileDim, tileDim, navTags } from '@model/level/level.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2 } from '@model/rect2.model';
import { NavGraph } from '@model/nav/nav-graph.model';
import { Vector2 } from '@model/vec2.model';
import { LevelMeta } from '@model/level/level-meta.model';
import { FloydWarshall } from '@model/nav/floyd-warshall.model';
import { initializeStore } from './create-store';
import { NavPath } from '@model/nav/nav-path.model';
import { LevelAuxState } from '@model/level/level-aux.model';
import { mapValues, testNever } from '@model/generic.model';

const ctxt: LevelWorkerContext = self as any;

const store = initializeStore(ctxt);
const dispatch = store.dispatch as LevelDispatchOverload;
const persistor = persistStore(store as any, null, () => {
  ctxt.postMessage({ key: 'level-worker-ready' });
});
persistor.pause(); // We save manually

const getLevel = (levelUid: string): LevelState | undefined =>
  store.getState().level.instance[levelUid];
const getLevelAux = (levelUid: string): LevelAuxState | undefined =>
  store.getState().level.aux[levelUid];

ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log({ levelWorkerReceived: msg });

  switch (msg.key) {
    case 'request-new-level': {
      dispatch(Act.registerLevel(msg.levelUid));
      dispatch(Act.updateLevel(msg.levelUid, {
        tileToggleSub: redact(levelToggleHandlerFactory(msg.levelUid).subscribe()),
        metaUpdateSub: redact(metaUpdateHandler(msg.levelUid).subscribe()),
      }));
      ctxt.postMessage({ key: 'worker-created-level', levelUid: msg.levelUid });
      break;
    }
    case 'request-destroy-level': {
      const level = getLevel(msg.levelUid);
      level?.tileToggleSub?.unsubscribe();
      level?.metaUpdateSub?.unsubscribe();
      dispatch(Act.unregisterLevel(msg.levelUid));
      break;
    }
    case 'add-level-meta': {
      // Snap to integers
      const [x, y] = [Math.round(msg.position.x), Math.round(msg.position.y)];
      const lp = new LevelMeta(msg.metaKey, Vector2.from({ x, y }));
      const metas = { ...getLevel(msg.levelUid)!.metas, [lp.key]: lp };
      dispatch(Act.updateLevel(msg.levelUid, { metas: metas }));
      break;
    }
    case 'request-level-data': {
      const level = getLevel(msg.levelUid);
      if (level) {
        ctxt.postMessage({ key: 'send-level-layers', levelUid: msg.levelUid,
          tileFloors: level.tileFloors.map(({ json }) => json),
          wallSegs: Object.values(level.wallSeg),
        });
        ctxt.postMessage({ key: 'send-level-metas', levelUid: msg.levelUid,
          metas: Object.values(level.metas).map(p => p.json),
        });
        sendLevelAux(msg.levelUid);
      }
      break;
    }
    case 'request-level-metas': {
      const level = getLevel(msg.levelUid);
      level && ctxt.postMessage({ key: 'send-level-metas', levelUid: msg.levelUid,
        metas: Object.values(level.metas).map(p => p.json),
      });
      break;
    }
    case 'ensure-floyd-warshall': {
      ensureFloydWarshall(msg.levelUid);
      break;
    }
    case 'request-nav-path': {
      ensureFloydWarshall(msg.levelUid);
      const { floydWarshall } = getLevel(msg.levelUid)!;
      const { navPath: toNavPath } = getLevelAux(msg.levelUid)!;

      const [src, dst] = [Vector2.from(msg.src), Vector2.from(msg.dst)];
      const points = floydWarshall!.findPath(src, dst);
      const navPath = new NavPath(msg.navPathUid, points);
      dispatch(Act.updateLevelAux(msg.levelUid, { navPath: addToLookup(navPath, toNavPath) }));
      ctxt.postMessage({ key: 'send-nav-path', levelUid: msg.levelUid, navPath: navPath.json });
      break;
    }
    case 'request-nav-view': {
      const { floors } = getLevel(msg.levelUid)!;
      const { centers, segs } = NavGraph.from(floors).dualGraph(floors);

      ctxt.postMessage({
        key: 'send-nav-view',
        levelUid: msg.levelUid,
        centers: centers.map(c => c.json),
        segs: segs.map(([u, v]) => [u.json, v.json]),
      });
      break;
    }
  }
});

function ensureFloydWarshall(levelUid: string) {
  const { floors, floydWarshall } = getLevel(levelUid)!;
  const navGraph = NavGraph.from(floors);
  // FloydWarshall.from is an expensive computation
  const nextFloydWarshall = floydWarshall || redact(FloydWarshall.from(navGraph));
  dispatch(Act.updateLevel(levelUid, { floydWarshall: nextFloydWarshall }));

  // Divide by 2 for undirected edges
  const [nodeCount, edgeCount, areaCount] = [navGraph.nodesArray.length, navGraph.edgesArray.length / 2, navGraph.groupedTris.length];
  const changed = floydWarshall !== nextFloydWarshall;
  ctxt.postMessage({ key: 'floyd-warshall-ready', levelUid, changed, nodeCount, edgeCount, areaCount });
}

function sendLevelAux(levelUid: string) {
  const { navPath } = getLevelAux(levelUid)!;
  ctxt.postMessage({ key: 'send-level-aux', levelUid,
    toNavPath: mapValues(navPath, (p) => p.json),
  });
}

function sendMetas(levelUid: string) {
  const metas = getLevel(levelUid)?.metas;
  metas && ctxt.postMessage({ key: 'send-level-metas', levelUid,
    metas: Object.values(metas).map(p => p.json),
  });
}

/**
 * Handle meta updates with side-effects for specified level.
 */
function metaUpdateHandler(levelUid: string) {
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

        /**
         * ISSUE can't say status 'ready' because have
         * two parallel processes i.e. for meta and for tiles/walls.
         */

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
 * Handle tile/wall toggling for specified level.
 */
function levelToggleHandlerFactory(levelUid: string) {
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

export default {} as Worker & { new (): LevelWorker };
