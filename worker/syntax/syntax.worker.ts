import { persistStore } from 'redux-persist';
import { testNever } from '@model/generic.model';
import reactRefreshTransform from '@model/code/react-refresh-transform';
import { SyntaxWorker, SyntaxWorkerContext } from './worker.model';
import { SyntaxDispatchOverload } from './redux.model';
import { prefixScssClasses, extractScssImportIntervals } from './analyze-scss.model';
import { computeClassifications } from './highlight.model';
import { initializeStore } from './create-store';
import { analyzeCodeImportsExports, toggleTsxComment, computeTsImportExportErrors, computeJsImportExportErrors } from './analyze-ts.model';

const ctxt: SyntaxWorkerContext = self as any;

/**
 * Create instance of store
 */
const store = initializeStore(ctxt);
const persistor = persistStore(store as any, null,
  // () => ctxt.postMessage({ key: 'worker-ready' }),
);

persistor.pause(); // We save manually
const _dispatch = store.dispatch as SyntaxDispatchOverload;

ctxt.addEventListener('message', async ({ data }) => {
  switch (data.key) {
    /**
     * Two use cases:
     * 1. For ts/tsx we check for errors in our particular sense, and
     *    provide code-intervals of module specifiers for error markers.
     * 2. For js we record code-intervals of module specifiers so they can be
     *   replaced by blob urls when mounted on the page.
     */
    case 'request-import-exports': {
      const analyzed = analyzeCodeImportsExports(data.filename, data.as, data.code);
      ctxt.postMessage({
        key: 'send-import-exports',
        origCode: data.code,
        ...analyzed,
        srcErrors: data.as === 'src' ? computeTsImportExportErrors(analyzed, data.filenames) : [],
        jsErrors: data.as === 'js' ? computeJsImportExportErrors(analyzed, data.filenames) : [],
      });
      break;
    }
    case 'request-status': {
      ctxt.postMessage({ key: 'worker-ready' });
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
    case 'request-toggled-tsx-comment': {
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
    case 'request-react-refresh-transform': {
      const { code } = await (reactRefreshTransform.run(data.code, data.filename));
      // console.log({ transformedJsCode: code });
      ctxt.postMessage({
        key: 'send-react-refresh-transform',
        origCode: data.code,
        transformedJs: code,
      });
      break;
    }
    default: throw testNever(data);
  }

});

export default {} as Worker & { new (): SyntaxWorker };
