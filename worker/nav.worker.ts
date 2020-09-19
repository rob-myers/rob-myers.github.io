import { fromEvent } from 'rxjs';
import { filter, map, debounceTime, tap } from 'rxjs/operators';
import { NavWorker, NavWorkerContext, Message, MessageFromMain, UpdateRoomNav } from './nav.msg';
import useStore from './nav.store';

const ctxt: NavWorkerContext = self as any;
const { api } = useStore.getState();

ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log(msg.key, { navWorkerReceived: msg });
  /**
   * TODO
   * - directly update `rooms` and `env.roomKeys`
   * - delay computation of each env's polyanya poly via debounceTime
   * - only respond to navpath requests when needed
   */
  switch (msg.key) {
    case 'ping-navworker': {
      ctxt.postMessage({ key: 'worker-ready' });
      break;
    }
    case 'create-env': {
      api.ensureEnv(msg.envKey, debounceEnvUpdates(msg.envKey));
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

function debounceEnvUpdates(envKey: string) {
  return fromEvent<Message<MessageFromMain>>(ctxt, 'message')
  .pipe(
    map(x => x.data),
    filter((x): x is UpdateRoomNav => x.key === 'update-room-nav' && x.envKey === envKey),
    debounceTime(300),
    tap(msg => {
      console.log(`TODO: update env '${msg.envKey}' using room '${msg.roomType}'`);
    })
  );
}

export default {} as Worker & { new (): NavWorker };
