import { LevelWorkerContext } from '@model/level/level.worker.model';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { redact, addToLookup } from '@model/redux.model';
import { mapValues } from '@model/generic.model';
import { NavPath } from '@model/level/nav/nav-path.model';
import { Vector2 } from '@model/vec2.model';
import { LevelMeta, LevelMetaGroup } from '@model/level/level-meta.model';
import { Act } from '@store/level/level.duck';
import { store, getLevel, getLevelAux } from './create-store';
import { handleLevelToggles, handleMetaUpdates } from './handle-edits';
import { ensureFloydWarshall, getMetaCuboids } from './nav-utils';

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
        ctxt.postMessage({
          key: 'worker-created-level',
          levelUid: msg.levelUid,
        });
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
          sendPreNavFloors(msg.levelUid);
          sendMetas(msg.levelUid);
          sendLevelAux(msg.levelUid);
        }
        break;
      }
      case 'request-level-metas': {
        sendMetas(msg.levelUid);
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
        const { navGraph } = getLevel(msg.levelUid)!;
        const groupedRects = navGraph.groupedRects;
        ctxt.postMessage({
          key: 'send-level-nav-rects',
          levelUid: msg.levelUid,
          rects: groupedRects.flatMap(x => x).map(r => r.json),
        });
        break;
      }
      case 'add-level-meta': {
        const meta = new LevelMeta(msg.metaKey);
        const metaGroups = {
          ...getLevel(msg.levelUid)!.metaGroups,
          [msg.metaGroupKey]: new LevelMetaGroup(
            msg.metaGroupKey,
            [meta],
            // Snap to integers
            new Vector2(Math.round(msg.position.x), Math.round(msg.position.y)),
          ),
        };
        dispatch(Act.updateLevel(msg.levelUid, { metaGroups }));
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
  const metaGroups = getLevel(levelUid)?.metaGroups;
  ctxt.postMessage({ key: 'send-level-metas', levelUid,
    metas: Object.values(metaGroups!).map(p => p.json),
  });
}

export function sendPreNavFloors(levelUid: string) {
  const { tilesSansCuts, innerWalls } = getLevel(levelUid)!;
  ctxt.postMessage({
    key: 'send-level-layers',
    levelUid,
    tileFloors: tilesSansCuts.map(({ json }) => json),
    wallSegs: innerWalls.map(([u, v]) => [u.json, v.json]),
    cuboids: getMetaCuboids(levelUid).map(({ base, height }) => ({
      base: base.json,
      height,
    })),
  });
}
