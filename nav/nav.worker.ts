import { fromEvent, firstValueFrom } from 'rxjs';
import { filter, map, tap, buffer, debounceTime } from 'rxjs/operators';

import type * as Geom from '@model/geom/geom.model';
import { Rect } from '@model/geom/rect.model';

import { NavWorker, NavWorkerContext, Message, MessageFromMain, UpdateRoomNav, RemoveRoomNav } from './nav.msg';
import useStore from './nav.store';

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
        /**
         * Scale nav rects by 100 and round for polyanya precision.
         * We'll have to scale navPaths by 1/100.
         */
        navRects: msg.navRects.map(r => Rect.from(r).scale(100).round()),
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
        /**
         * TODO navpath search
         */
        // const { src, dst } = msg;
        // const navPath = findNavPathAlt(
        //   polyanyaMesh,
        //   { x: Math.round(src.x * 100), y: Math.round(src.y * 100) },
        //   { x: Math.round(dst.x * 100), y: Math.round(dst.y * 100) },
        // ).map<Geom.VectorJson>(({ x, y }) => ({ x: x/100, y: y/100 }));
        ctxt.postMessage({ key: 'navpath-response', msgUid: msg.msgUid, navPath: [] });
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
