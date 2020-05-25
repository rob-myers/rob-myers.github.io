declare function importScripts(...urls: string[]): void;
self.Prism = { disableWorkerMessageHandler: true } as any;
importScripts('/prism.1-20-0.tsx.tomorrow-night.js');

import { persistStore } from 'redux-persist';
import { SyntaxWorker, SyntaxWorkerContext } from './worker.model';
import { SyntaxDispatchOverload } from './redux.model';
import { initializeStore } from './create-store';
import { flattenTokens, Classification, getLineNumberAndOffset } from './highlight.model';
import { testNever } from '@model/generic.model';

const ctxt: SyntaxWorkerContext = self as any;
const Prism = self.Prism;

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
     * Source https://github.com/rekit/rekit-studio/blob/master/src/features/editor/workers/syntaxHighlighter.js
     */
    case 'request-highlights': {
      try {
        const tokens = Prism.tokenize(data.code, Prism.languages.tsx);
        // See PR https://github.com/PrismJS/prism/pull/1357/files
        Prism.hooks.run('after-tokenize', {
          code: data.code,
          grammar: Prism.languages.tsx,
          language: 'tsx',
          tokens,
        });
        // console.log({ tokens });
    
        let pos = 0;
        const lines = data.code.split('\n').map(line => line.length);
        const classifications = [] as Classification[];

        flattenTokens(tokens).forEach(token => {
          if (typeof token === 'string') {
            if (token === 'console') {
              token = {
                content: 'console',
                type: 'globals',
                length: 7,
              } as Prism.Token;
            } else {
              pos += token.length;
              return;
            }
          }
    
          const { offset: startOffset, line: startLine } = getLineNumberAndOffset(pos, lines);
          const { offset: endOffset, line: endLine } = getLineNumberAndOffset(pos + token.length, lines);
          let kind = token.type;
          if (kind === 'keyword') {
            kind = `${token.content}-keyword`;
          }
          if (token.content === 'constructor' && token.type === 'function') {
            kind = 'constructor-keyword';
          }
          if (token.content === '=>') {
            kind = 'arrow-operator';
          }

          classifications.push({
            start: pos + 1 - startOffset,
            end: pos + 1 + token.length - endOffset,
            kind,
            startLine,
            endLine,
          });
          pos += token.length;
        });
    
        // console.log({ workerClassifications: classifications });
        ctxt.postMessage({
          key: 'send-highlights',
          classifications, 
          editorKey: data.editorKey,
        });
      } catch (e) {
        /* Ignore error */
        console.log('syntax-highlight error:', e);
      }
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
