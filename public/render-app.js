import preventTreeShake from './es-react-refresh/bootstrap';
preventTreeShake();

import React from './es-react/react';
import ReactDOM from './es-react/react-dom';
import { Provider } from './es-react-redux/index';
import { ErrorBoundary } from './error-boundary';

let store;

export function setStore(nextStore) {
  store = nextStore;
}

let sendAppInvalidSignal;

export function storeAppInvalidSignaller(fn) {
  sendAppInvalidSignal = fn;
}

let App;

/**
 * Seems can only dynamically import blob url by evaluating code.
 * TODO use Function('...')(...) instead.
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
  const ErrorBoundedApp = React.createElement(ErrorBoundary, { sendAppInvalidSignal }, React.createElement(App));
  const ProvidedApp = React.createElement(Provider, { store }, ErrorBoundedApp);
  ReactDOM.render(ProvidedApp, rootEl);
}

export function unmountAppAt(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    ReactDOM.unmountComponentAtNode(el);
    // console.log('unmounted app', { elementId })
  }
}

export function forgetAppAndStore() {
  // store = undefined;
  App = undefined;
}
