import preventTreeShake from './es-react-refresh/bootstrap';
preventTreeShake();

import { compose, createStore, combineReducers, applyMiddleware } from './es-redux/redux';
import React from './es-react/react';
import ReactDOM from './es-react/react-dom';
import { Provider } from './es-react-redux/index';
import { ErrorBoundary } from './error-boundary';

let rootReducer;

/** We store thunks here for better hot-reloading. */
let thunkLookup = {};

const thunkMiddleware = () =>
  (params) => // params has { dispatch, getState }
    (next) => // native dispatch
      (action) => { // received action
        if ('args' in action && action.type in thunkLookup) {
          // provide ({ dispatch, getState, state }, actionArgs)
          return thunkLookup[action.type](
            { ...params, state: params.getState() },
            action.args,
          );
        }
        next(action);
        return;
      };

export function updateThunks(nextThunkLookup) {
  thunkLookup = nextThunkLookup;
}

let store;

export function initializeRuntimeStore(preloadedState) {
  if (store || typeof window === 'undefined') {
    return;
  }
  rootReducer = combineReducers({});
  const composeWithDevTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      shouldHotReload: false,
      serialize: {
        // Handle huge/cyclic objects by redacting them
        replacer: (_, value) =>
          value && value.devToolsRedaction
            ? `Redacted<${value.devToolsRedaction}>`
            : typeof value === 'function' ? 'Redacted<function>' : value,
      },
    }) || compose;
  
  store = createStore(
    rootReducer,
    preloadedState,
    composeWithDevTools(
      applyMiddleware(
        thunkMiddleware(),
      ),
    ),
  );
}

export function replaceRootReducerFromBlobUrl(blobUrl) {
  return new Promise((resolve) => eval(`
    import('${blobUrl}').then((imported) => {
      const createRootReducer = imported.default;
      store.replaceReducer(createRootReducer());
      resolve();
    });
  `)
  );
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
  const ErrorBoundedApp = React.createElement(ErrorBoundary, null, React.createElement(App));
  const ProvidedApp = React.createElement(Provider, { store }, ErrorBoundedApp);
  ReactDOM.render(ProvidedApp, rootEl);
}

export function unmountAppAt(elementId) {
  const el = document.getElementById(elementId);
  el && ReactDOM.unmountComponentAtNode(el);
}
