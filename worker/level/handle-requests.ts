import { LevelWorkerContext } from '@model/level/level.worker.model';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { redact, addToLookup } from '@model/redux.model';
import { mapValues } from '@model/generic.model';
import { NavPath } from '@model/nav/nav-path.model';
import { Vector2 } from '@model/vec2.model';
import { LevelMeta } from '@model/level/level-meta.model';
import { Act } from '@store/level/level.duck';
import { store, getLevel, getLevelAux } from './create-store';
import { handleLevelToggles, handleMetaUpdates } from './handle-edits';
import { ensureFloydWarshall } from './handle-nav';
import { NavGraph } from '@model/nav/nav-graph.model';

const ctxt: LevelWorkerContext = self as any;
const dispatch = store.dispatch as LevelDispatchOverload;

export function listenForRequests() {
  ctxt.addEventListener('message', async ({ data: msg }) => {
    console.log({ levelWorkerReceived: msg });
  
    switch (msg.key) {
      case 'request-new-level': {
        dispatch(Act.registerLevel(msg.levelUid));
        dispatch(Act.updateLevel(msg.levelUid, {
          tileToggleSub: redact(handleLevelToggles(msg.levelUid).subscribe()),
          metaUpdateSub: redact(handleMetaUpdates(msg.levelUid).subscribe()),
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
      case 'request-nav-rects': {
        const { floors } = getLevel(msg.levelUid)!;
        const groupedRects = NavGraph.computeRects(floors);
        ctxt.postMessage({
          key: 'send-level-nav-rects',
          levelUid: msg.levelUid,
          rects: groupedRects.flatMap(x => x).map(r => r.json),
        });
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
    }
  });
}

export function sendLevelAux(levelUid: string) {
  const { navPath } = getLevelAux(levelUid)!;
  ctxt.postMessage({ key: 'send-level-aux', levelUid,
    toNavPath: mapValues(navPath, (p) => p.json),
  });
}

export function sendMetas(levelUid: string) {
  const metas = getLevel(levelUid)?.metas;
  metas && ctxt.postMessage({ key: 'send-level-metas', levelUid,
    metas: Object.values(metas).map(p => p.json),
  });
}
