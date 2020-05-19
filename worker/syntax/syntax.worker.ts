import { persistStore } from 'redux-persist';
import { SyntaxWorker, SyntaxWorkerContext } from './worker.model';
import { SyntaxDispatchOverload } from './redux.model';
import { initializeStore } from './create-store';

const ctxt: SyntaxWorkerContext = self as any;

/**
 * Create instance of store
 */
export const store = initializeStore(ctxt);
const persistor = persistStore(store as any, null,
  // Initial action
  () =>  ctxt.postMessage({ key: 'worker-ready' }),
);

persistor.pause(); // We save manually
const _dispatch = store.dispatch as SyntaxDispatchOverload;

/**
 * TODO listen for messages
 */

export default {} as Worker & { new (): SyntaxWorker };
