import { persistStore } from 'redux-persist';
import { SyntaxWorker, SyntaxWorkerContext } from './worker.model';
import { SyntaxDispatchOverload } from './redux.model';
import { initializeStore } from './create-store';
import { testNever } from '@model/generic.model';
import { computeClassifications } from './highlight.model';
import { analyzeTsImportsExports, toggleTsxComment } from './analyze-ts.model';
import { prefixScssClasses, extractScssImportIntervals } from './analyze-scss.model';

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
      ctxt.postMessage({
        key: 'send-import-exports',
        origCode: data.code,
        ...analyzeTsImportsExports(data.filename, data.code),
      });
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
    case 'request-scss-prefixing': {
      try {
        ctxt.postMessage({
          key: 'send-prefixed-scss',
          origScss: data.scss,
          prefixedScss: prefixScssClasses(data.scss, data.filename),
          pathIntervals: extractScssImportIntervals(data.scss),
          error: null,
        });
      } catch (e) {
        ctxt.postMessage({
          key: 'send-prefixed-scss',
          origScss: data.scss,
          prefixedScss: null,
          pathIntervals: [],
          error: `${e}`,
        });
      }
      break;
    }
    case 'toggle-tsx-comments': {
      ctxt.postMessage({
        key: 'send-tsx-commented',
        origCode: data.code,
        result: toggleTsxComment(
          data.code,
          data.startLineStartPos,
          data.endLineEndPos,
        ),
      });
      break;
    }
    default: throw testNever(data);
  }

});

export default {} as Worker & { new (): SyntaxWorker };
