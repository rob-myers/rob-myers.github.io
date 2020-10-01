import { fromEvent, firstValueFrom } from 'rxjs';
import { filter, map, tap, buffer, debounceTime } from 'rxjs/operators';

import { Rect } from '@model/geom/rect.model';

import { NavWorker, NavWorkerContext, Message, MessageFromMain, UpdateRoomNav, RemoveRoomNav } from './nav.msg';
import useStore from './nav.store';
import { Vector3 } from 'three';
import { geomService } from '@model/geom/geom.service';
import { recastService } from '@model/env/recast.service';

const ctxt: NavWorkerContext = self as any;
const { api } = useStore.getState();

ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log(msg.key, { navWorkerReceived: msg });

  switch (msg.key) {
    case 'ping-navworker': {
      ctxt.postMessage({ key: 'worker-ready' });
      break;
    }
    case 'create-env': {
      api.ensureEnv(msg.envKey, updateEnvPolyanyaMesh$(msg.envKey));
      break;
    }
    case 'remove-env': {
      api.removeEnv(msg.envKey);
      break;
    }
    case 'update-room-nav': {
      api.ensureRoom(msg.envKey, msg.roomUid);

      api.updateRoom({ key: msg.roomUid, envKey: msg.envKey,
        navRects: msg.navRects.map(r => Rect.from(r)),
      });
      break;
    }
    case 'remove-room-nav': {
      api.removeRoom(msg.envKey, msg.roomUid);
      break;
    }
    case 'request-navpath': {
      const { navReady$ } = useStore.getState().env[msg.envKey];
      await firstValueFrom(navReady$.pipe(filter((ready) => ready)));

      try {
        const src = new Vector3(msg.src.x, 0, msg.src.y);
        const dst = new Vector3(msg.dst.x, 0, msg.dst.y);
        const navPath = recastService.computePath(src, dst);
        // const group = pathfinding.getGroup('zone1', src);
        // const navPath = pathfinding.findPath(src, dst, 'zone1', group);
        // console.log({src, dst, group, navPath})
        const cleanNavPath = geomService.removePathReps(
          [msg.src].concat(navPath.map(({ x, z }) => ({ x, y: z }))));
        ctxt.postMessage({ key: 'navpath-response', msgUid: msg.msgUid, navPath: cleanNavPath });
      } catch (e) {
        console.error('nav error', e);
        ctxt.postMessage({ key: 'navpath-response', msgUid: msg.msgUid, navPath: [], error: `${e}` });
      }
      
      break;
    }
  }
});

/** Debounce env's nav updates and update polyanya mesh */
function updateEnvPolyanyaMesh$(envKey: string) {
  return envUpdate$(envKey).pipe(
    // Buffer update messages until 250ms after seeing a message
    // NOTE buffer only being used for debugging
    buffer(envUpdate$(envKey).pipe(debounceTime(250))),
    tap(msgs => {
      console.log(`Updating env '${msgs[0].envKey}' using rooms '${msgs.map(x => x.roomType)}'`);
      api.updateEnvNavigation(envKey);
    }),
  );
}

/** Observe an env's nav updates */
function envUpdate$(envKey: string) {
  return fromEvent<Message<MessageFromMain>>(ctxt, 'message').pipe(
    map(x => x.data),
    filter((x): x is UpdateRoomNav | RemoveRoomNav =>
      x.key === 'update-room-nav' && x.envKey === envKey
      || x.key === 'remove-room-nav' && x.envKey === envKey
    ),
  );
}

export default {} as Worker & { new (): NavWorker };
