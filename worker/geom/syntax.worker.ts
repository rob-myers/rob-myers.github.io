import { persistStore } from 'redux-persist';
import { SyntaxWorker, GeomWorkerContext } from './worker.model';
import { GeomDispatchOverload } from './redux.model';
import { initializeStore } from './create-store';

const ctxt: GeomWorkerContext = self as any;

/**
 * Create instance of store
 */
const store = initializeStore(ctxt);
const persistor = persistStore(store as any, null,
  // () => ctxt.postMessage({ key: 'worker-ready' }),
);

persistor.pause(); // We save manually
const _dispatch = store.dispatch as GeomDispatchOverload;

ctxt.addEventListener('message', async ({ data }) => {
  switch (data.key) {
    case 'request-status': {
      ctxt.postMessage({ key: 'worker-ready' });
      break;
    }
    // default: throw testNever(data);
  }

});

export default {} as Worker & { new (): SyntaxWorker };
