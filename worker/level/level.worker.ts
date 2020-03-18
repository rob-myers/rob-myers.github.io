import { persistStore } from 'redux-persist';
import { fromEvent } from 'rxjs';
import { filter, map, delay, auditTime, tap } from 'rxjs/operators';

import { LevelWorkerContext, LevelWorker, MessageFromLevelParent, ToggleLevelTile, ToggleLevelWall, UpdateLevelMeta, DuplicateLevelMeta, RemoveLevelMeta } from '@model/level/level.worker.model';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { Act } from '@store/level/level.worker.duck';
import { Message } from '@model/worker.model';
import { redact, removeFromLookup } from '@model/redux.model';
import { LevelState, floorInset, smallTileDim, tileDim, navTags } from '@model/level/level.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2 } from '@model/rect2.model';
import { NavGraph } from '@model/nav/nav-graph.model';
import { Vector2 } from '@model/vec2.model';
import { LevelMeta } from '@model/level/level-meta.model';
import { FloydWarshall } from '@model/nav/floyd-warshall.model';
import { initializeStore } from './create-store';

const ctxt: LevelWorkerContext = self as any;

const store = initializeStore(ctxt);
const dispatch = store.dispatch as LevelDispatchOverload;
const persistor = persistStore(store as any, null, () => {
  ctxt.postMessage({ key: 'level-worker-ready' });
});
persistor.pause(); // We save manually

const getLevel = (levelUid: string): LevelState | undefined =>
  store.getState().level.instance[levelUid];

/**
 * Worker message handler.
 */
ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log({ levelWorkerReceived: msg });

  switch (msg.key) {
    case 'request-new-level': {
      dispatch(Act.registerLevel(msg.levelUid));
      dispatch(Act.updateLevel(msg.levelUid, {
        tileToggleSub: redact(levelToggleHandlerFactory(msg.levelUid).subscribe()),
        metaUpdateSub: redact(metaUpdateHandlerFactory(msg.levelUid).subscribe()),
      }));
      ctxt.postMessage({ key: 'worker-created-level', levelUid: msg.levelUid });
      break;
    }
    case 'request-destroy-level': {
      const level = getLevel(msg.levelUid)!;
      level.tileToggleSub?.unsubscribe();
      level.metaUpdateSub?.unsubscribe();
      dispatch(Act.unregisterLevel(msg.levelUid));
      break;
    }
    case 'add-level-meta': {
      const lp = new LevelMeta(msg.metaKey, Vector2.from(msg.position));
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
    case 'compute-floyd-warshall': {
      const { floors } = getLevel(msg.levelUid)!;
      const navGraph = NavGraph.from(floors);
      const floydWarshall = redact(FloydWarshall.from(navGraph));
      // console.log({ floydWarshall });
      dispatch(Act.updateLevel(msg.levelUid, { floydWarshall }));
      ctxt.postMessage({ key: 'floyd-warshall-ready', levelUid: msg.levelUid });
      break;
    }
    case 'request-nav-path': {
      const { floydWarshall } = getLevel(msg.levelUid)!;
      if (floydWarshall) {
        const navPath = floydWarshall.findPath(Vector2.from(msg.src), Vector2.from(msg.dst));
        console.log({ navPath });
      } else {
        console.error(`level "${msg.levelUid}" not ready for ${msg.key}`);
      }
      break;
    }
  }
});

/**
 * Handle meta updates side-effects for specified level.
 */
function metaUpdateHandlerFactory(levelUid: string) {
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
            const meta = metas[msg.metaKey].clone(msg.newMetaKey, Vector2.from(msg.position));
            dispatch(Act.updateLevel(levelUid, { metas: { ...metas, [meta.key]: meta }}));
            return navTags.some(tag => meta.tags.includes(tag));
          }
          case 'remove-level-meta': {
            const nextMetas = removeFromLookup(msg.metaKey, metas);
            dispatch(Act.updateLevel(msg.levelUid, { metas: nextMetas }));
            return navTags.some(tag => metas[msg.metaKey].tags.includes(tag));
          }
        }
      }),
      filter((updateNav) => {
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
 * Handle tile toggling for specified level.
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
          }
        }

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

function sendMetas(levelUid: string) {
  const metas = getLevel(levelUid)?.metas;
  metas && ctxt.postMessage({ key: 'send-level-metas', levelUid,
    metas: Object.values(metas).map(p => p.json),
  });
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
  const navGraph = NavGraph.from(floors);
  ctxt.postMessage({
    key: 'send-nav-graph',
    levelUid,
    navGraph: navGraph.json,
    floors: floors.map(({ json }) => json), // Debug only
  });
  // console.log({ fw: FloydWarshall.from(navGraph) });

  sendMetas(levelUid);
}

export default {} as Worker & { new (): LevelWorker };
