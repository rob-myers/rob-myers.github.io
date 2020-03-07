import { LevelWorkerContext, LevelWorker } from '@model/level/level.worker.model';
import { initializeStore } from './create-store';
import { LevelDispatchOverload } from '@model/level/level.redux.model';
import { persistStore } from 'redux-persist';

const ctxt: LevelWorkerContext = self as any;

const store = initializeStore(ctxt);
const _dispatch = store.dispatch as LevelDispatchOverload;

const persistor = persistStore(store as any, null, () => {
  // Invoked after rehydration
  ctxt.postMessage({ key: 'level-worker-ready' });
});
persistor.pause(); // We save manually

ctxt.addEventListener('message', async ({ data: msg }) => {
  console.log({ levelWorkerReceived: msg });

});

export default {} as Worker & {new (): LevelWorker};
