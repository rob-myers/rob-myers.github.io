import React from './es-react/react';
import ReactDOM from './es-react/react-dom';
import { ErrorBoundary } from './error-boundary';

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