import preventTreeShake from './es-react-refresh/bootstrap';
preventTreeShake();

import { compose, createStore, combineReducers, applyMiddleware } from './es-redux/redux';
import React from './es-react/react';
import ReactDOM from './es-react/react-dom';
import { ErrorBoundary } from './error-boundary';

let rootReducer = combineReducers({});

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
  const composeWithDevTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  store = createStore(
    rootReducer,
    preloadedState,
    composeWithDevTools({
      shouldHotReload: false,
      serialize: {
        // Handle huge/cyclic objects by redacting them
        replacer: (_, value) =>
          value && value.devToolsRedaction
            ? `Redacted<${value.devToolsRedaction}>`
            : typeof value === 'function' ? 'Redacted<function>' : value,
      },
    })(
      applyMiddleware(
        thunkMiddleware(),
      ),
    )
  );
}

export function updateRootReducerFromBlobUrl(blobUrl) {
  return new Promise((resolve) => eval(`
    import('${blobUrl}').then((imported) => {
      store.replaceReducer(imported.default);
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
  const WrappedApp = React.createElement(ErrorBoundary, null, React.createElement(App));
  ReactDOM.render(WrappedApp, rootEl);
}

export function unmountAppAt(elementId) {
  const el = document.getElementById(elementId);
  el && ReactDOM.unmountComponentAtNode(el);
}
