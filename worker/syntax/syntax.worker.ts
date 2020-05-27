import { persistStore } from 'redux-persist';
import { SyntaxWorker, SyntaxWorkerContext } from './worker.model';
import { SyntaxDispatchOverload } from './redux.model';
import { initializeStore } from './create-store';
import { testNever } from '@model/generic.model';
import { computeClassifications, Classification } from './highlight.model';

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
    /**
     * Source https://github.com/cancerberoSgx/jsx-alone/blob/master/jsx-explorer/src/codeWorker/extractCodeDecorations.ts
     */
    case 'request-tsx-highlights': {
      const { code } = data;

      const classifications = [] as Classification[];
      computeClassifications(code, classifications);

      ctxt.postMessage({
        key: 'send-tsx-highlights',
        classifications, 
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
