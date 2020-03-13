import { persistStore } from 'redux-persist';
import { fromEvent } from 'rxjs';
import { filter, map, delay, auditTime } from 'rxjs/operators';

import { LevelWorkerContext, LevelWorker, MessageFromLevelParent, ToggleLevelTile } from '@model/level/level.worker.model';
import { initializeStore } from './create-store';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { Act } from '@store/level/level.worker.duck';
import { Message } from '@model/worker.model';
import { redact } from '@model/redux.model';
import { LevelState, wallDepth, floorInset } from '@model/level/level.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2 } from '@model/rect2.model';
import { flatten } from '@model/generic.model';
import { NavGraph } from '@model/nav/nav-graph.model';

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
      dispatch(Act.registerLevel(msg.levelUid, msg.tileDim));
      dispatch(Act.updateLevel(msg.levelUid, {
        tileToggleSub: redact(
          levelToggleHandlerFactory(msg.levelUid).subscribe()
        ),
      }));
      ctxt.postMessage({ key: 'worker-created-level', levelUid: msg.levelUid });
      break;
    }
    case 'request-destroy-level': {
      const level = getLevel(msg.levelUid);
      level?.tileToggleSub?.unsubscribe();
      dispatch(Act.unregisterLevel(msg.levelUid));
      break;
    }
    case 'toggle-level-tile': {
      /**
       * Handled by an rxjs Observable.
       */
      break;
    }
  }
});

/**
 * Handle tile toggling for specified level.
 */
function levelToggleHandlerFactory(levelUid: string) {
  return fromEvent<Message<MessageFromLevelParent>>(ctxt, 'message')
    .pipe(
      map(({ data }) => data),
      filter((msg): msg is ToggleLevelTile =>
        msg.key === 'toggle-level-tile' && msg.levelUid === levelUid
      ),
      /**
       * Create fresh outline via union/cutting
       */
      map(({ tile }) => {
        const { tileDim, tileFloors: prevTileFloors } = getLevel(levelUid)!;
        const rect = new Rect2(tile.x, tile.y, tileDim, tileDim);
        const tileFloors = Poly2.xor(prevTileFloors, rect.poly2);
        dispatch(Act.updateLevel(levelUid, { tileFloors: tileFloors.map((x) => redact(x)) }));
        ctxt.postMessage({ key: 'send-level-outline', levelUid, outlinePoly: tileFloors.map(({ json }) => json) });
        return tileFloors;
      }),
      delay(20),
      /**
       * Create walls and floors
       */
      map((outline) => {
        const wallInsets = flatten(outline.map(x => x.createInset(wallDepth)));
        const walls = Poly2.cutOut(wallInsets, outline);
        const floors = Poly2.union(flatten(outline.map(x => x.createInset(floorInset))));
        // // Basic refinement of triangulation
        // const centers = floors.map(f => f.triangulation.map(c => c.centerOfBoundary));
        // // console.log({ centers });
        // floors.forEach((floor, i) => floor.addSteinerPoints(centers[i]).customTriangulate());

        dispatch(Act.updateLevel(levelUid, {
          walls: walls.map((x) => redact(x)),
          floors: floors.map(x => redact(x)),
        }));
        ctxt.postMessage({
          key: 'send-level-walls',
          levelUid,
          walls: walls.map(({ json }) => json),
          floors: floors.map(({ json }) => json),
        });
        return floors;
      }),
      auditTime(300),
      /**
       * Triangulate (could be refined).
       */
      map(floors => {
        ctxt.postMessage({
          key: 'send-level-tris',
          levelUid, // Mutates floors in level state
          tris: floors.flatMap(x => x.triangulation).map(({ json }) => json),
        });
        return floors;
      }),
      // auditTime(500),
      /**
       * Send navgraph
       */
      map(floors => {
        const navGraph = NavGraph.from(floors);
        ctxt.postMessage({
          key: 'send-nav-graph',
          levelUid,
          navGraph: navGraph.json,
          floors: floors.map(({ json }) => json),
        });
        // // floyd warshall test
        // const fw = FloydWarshall.from(navGraph);
        // console.log({ fw });

        return floors;
      }),
      /**
       * TODO Floyd marshall
       */
    );
}

export default {} as Worker & { new (): LevelWorker };
