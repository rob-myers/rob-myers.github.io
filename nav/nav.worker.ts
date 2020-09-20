import { fromEvent } from 'rxjs';
import { filter, map, tap, buffer, debounceTime } from 'rxjs/operators';
import { NavWorker, NavWorkerContext, Message, MessageFromMain, UpdateRoomNav, RemoveRoomNav } from './nav.msg';
import useStore from './nav.store';

const ctxt: NavWorkerContext = self as any;
const { api } = useStore.getState();

ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log(msg.key, { navWorkerReceived: msg });
  /**
   * TODO
   * - directly update `rooms` and `env.roomKeys`
   * - delay computation of each env's polyanya poly via debounceTime
   * - only respond to navpath requests when ready
   */
  switch (msg.key) {
    case 'ping-navworker': {
      ctxt.postMessage({ key: 'worker-ready' });
      break;
    }
    case 'create-env': {
      api.ensureEnv(msg.envKey, bufferedEnvUpdates$(msg.envKey));
      break;
    }
    case 'remove-env': {
      api.removeEnv(msg.envKey);
      break;
    }
    case 'update-room-nav': {
      api.ensureRoom(msg.envKey, msg.roomUid);
      api.updateRoom({ key: msg.roomUid, envKey: msg.envKey, navPartitions: msg.navPartitions });
      break;
    }
    case 'remove-room-nav': {
      api.removeRoom(msg.envKey, msg.roomUid);
      break;
    }
  }
});

function bufferedEnvUpdates$(envKey: string) {
  return envUpdate$(envKey).pipe(
    buffer(envUpdate$(envKey).pipe(debounceTime(250))),
    tap(msgs => {
      console.log(`[TODO] update env '${msgs[0].envKey}' using rooms '${msgs.map(x => x.roomType)}'`);
      /**
       * TODO compute polyanya polys and set env ready
       */
    }),
  );
}

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
