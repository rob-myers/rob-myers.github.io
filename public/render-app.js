import RefreshRuntime from './es-react-refresh/runtime'
import RefreshHelpers from './es-react-refresh/helpers'
import { REFRESH_HELPERS, REFRESH_REG, REFRESH_SIG } from './constants';

import React from './es-react/react';
import ReactDOM from './es-react/react-dom';
import { ErrorBoundary } from './error-boundary';

if (typeof window !== 'undefined') {
  // Hook into ReactDOM initialization
  console.log('[commitment] react-refresh injecting into global hook')
  RefreshRuntime.injectIntoGlobalHook(window)
  
  window[REFRESH_REG] = function (filename, type, id) {
    RefreshRuntime.register(type, filename + ' ' + id)
  }
  window[REFRESH_SIG] = RefreshRuntime.createSignatureFunctionForTransform
  
  // Register global helpers
  window[REFRESH_HELPERS] = RefreshHelpers
  
  /**
   * We need the dynamic app module to refer to the same `react`.
   * Tried `import * as React from ${window.location.origin}/es-react/react.js`
   * inside dynamic module. However this yields a different copy of react,
   * because module specifier different.
   */
  typeof window !== 'undefined' && (window.__LIVE_REACT__ = React);
}

let App;

/**
 * Seems we can only dynamically import blob-url via eval.
 * TODO use Function('...')() instead.
 */
export function storeAppFromBlobUrl(blobUrl) {
  return new Promise((resolve) => eval(`
    import('${blobUrl}').then((imported) => {
      App = imported.default;
      resolve();
    });
  `)
  );
}

export function renderAppAt(elementId) {
  const rootEl = document.getElementById(elementId);
  ReactDOM.unmountComponentAtNode(rootEl);
  const WrappedApp = React.createElement(ErrorBoundary, null, React.createElement(App));
  ReactDOM.render(WrappedApp, rootEl);
  // ReactDOM.render(React.createElement(App), rootEl)
}

export function unmountAppAt(elementId) {
  const el = document.getElementById(elementId);
  el && ReactDOM.unmountComponentAtNode(el);
}