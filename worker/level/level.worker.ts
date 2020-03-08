import { persistStore } from 'redux-persist';
import { fromEvent } from 'rxjs';
import { filter, map, bufferTime, delay } from 'rxjs/operators';

import { LevelWorkerContext, LevelWorker, MessageFromLevelParent, ToggleLevelTile } from '@model/level/level.worker.model';
import { initializeStore } from './create-store';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { Act } from '@store/level/level.worker.duck';
import { Message } from '@model/worker.model';
import { redact } from '@model/redux.model';
import { LevelState } from '@model/level/level.model';
import { Poly2 } from '@model/poly2.model';
import { Rect2 } from '@model/rect2.model';
import { flatten } from '@model/generic.model';

const ctxt: LevelWorkerContext = self as any;

const store = initializeStore(ctxt);
const dispatch = store.dispatch as LevelDispatchOverload;
const persistor = persistStore(store as any, null, () => {
  ctxt.postMessage({ key: 'level-worker-ready' });
});
persistor.pause(); // We save manually

const getLevel = (levelUid: string): LevelState | undefined =>
  store.getState().level.instance[levelUid];

const wallDepth = 4;
const floorInset = 20;

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
      bufferTime(100),
      filter(msgs => msgs.length > 0),
      /**
       * Mutate grid and collect rects to add/subtract
       */
      map((msgs) => {
        const { grid, tileDim } = getLevel(levelUid)!;
        const [adds, subs] = [[] as Poly2[], [] as Poly2[]];

        msgs.forEach(({ tile }) => {
          const key = `${tile.x},${tile.y}`;
          const poly = new Rect2(tile.x, tile.y, tileDim, tileDim).poly2;
          (grid[key] ? subs : adds).push(poly);
          grid[key] = grid[key] ? undefined : {};
        });
        dispatch(Act.updateLevel(levelUid, { grid }));
        return { adds, subs };
      }),
      /**
       * Create fresh outline via union/cutting
       */
      map(({ adds, subs }) => {
        const { outline: outlinePoly } = getLevel(levelUid)!;
        const nextPoly = Poly2.cutOut(subs, Poly2.union([...outlinePoly, ...adds]));
        dispatch(Act.updateLevel(levelUid, { outline: nextPoly.map((x) => redact(x)) }));
        ctxt.postMessage({ key: 'send-level-grid', levelUid, outlinePoly: nextPoly.map(({ json }) => json) });
        return nextPoly;
      }),
      delay(100),
      /**
       * Create walls and floors
       */
      map((outline) => {
        const insets = flatten(outline.map(x => x.createInset(wallDepth)));
        const walls = Poly2.cutOut(insets, outline);
        const floors = Poly2.union(flatten(outline.map(x => x.createInset(floorInset))));

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
      // delay(200),
      /**
       * Triangulate (can be refined).
       * Floyd marshall should be computed when finished editing.
       */
      map(floors => {
        // Mutates floors in level state
        floors.forEach((floor) => floor.qualityTriangulate());
        ctxt.postMessage({
          key: 'send-level-tris',
          levelUid,
          tris: floors.flatMap(x => x.triangulation).map(({ json }) => json),
        });
        return null;
      }),
    );
}

export default {} as Worker & { new (): LevelWorker };
