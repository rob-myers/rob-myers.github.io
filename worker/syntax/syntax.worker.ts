import { persistStore } from 'redux-persist';
import { SyntaxWorker, SyntaxWorkerContext } from './worker.model';
import { SyntaxDispatchOverload } from './redux.model';
import { initializeStore } from './create-store';
import { testNever } from '@model/generic.model';
import { computeClassifications } from './highlight.model';

const ctxt: SyntaxWorkerContext = self as any;

/**
 * Create instance of store
 */
const store = initializeStore(ctxt);
const persistor = persistStore(store as any, null,
  () =>  ctxt.postMessage({ key: 'worker-ready' }),
);

persistor.pause(); // We save manually
const _dispatch = store.dispatch as SyntaxDispatchOverload;

/**
 * Listen for messages
 */
ctxt.addEventListener('message', ({ data }) => {
  switch (data.key) {
    case 'request-import-exports': {
      /**
       * TODO analyze transpiled javascript,
       * running information about imports/exports
       */
      console.log({ requestedImportsExports: data.filename });
      break;
    }
    case 'request-tsx-highlights': {
      ctxt.postMessage({
        key: 'send-tsx-highlights',
        classifications: computeClassifications(data.code),
        editorKey: data.editorKey,
      });
      break;
    }
    case 'request-status': {
      ctxt.postMessage({ key: 'worker-ready' });
      break;
    }
    default: throw testNever(data);
  }

});

export default {} as Worker & { new (): SyntaxWorker };
