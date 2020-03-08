import { LevelWorkerContext, LevelWorker } from '@model/level/level.worker.model';
import { initializeStore } from './create-store';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { persistStore } from 'redux-persist';
import { Act } from '@store/level/level.worker.duck';

const ctxt: LevelWorkerContext = self as any;

const store = initializeStore(ctxt);
const dispatch = store.dispatch as LevelDispatchOverload;

const persistor = persistStore(store as any, null, () => {
  // Invoked after rehydration
  ctxt.postMessage({ key: 'level-worker-ready' });
});
persistor.pause(); // We save manually

ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log({ levelWorkerReceived: msg });

  switch (msg.key) {
    case 'request-new-level': {
      dispatch(Act.registerLevel(msg.levelUid));
      ctxt.postMessage({ key: 'worker-created-level', levelUid: msg.levelUid });
      break;
    }
    case 'request-destroy-level': {
      dispatch(Act.unregisterLevel(msg.levelUid));
      break;
    }
  }

});

export default {} as Worker & { new (): LevelWorker };
