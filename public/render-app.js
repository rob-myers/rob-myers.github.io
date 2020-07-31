import preventTreeShake from './es-react-refresh/bootstrap';
preventTreeShake();

import React from './es-react/react';
import ReactDOM from './es-react/react-dom';
import { Provider } from './es-react-redux/index';
import { ErrorBoundary } from './error-boundary';

/**
 * TODO
 * - use store from main app instead
 * - remove reducer-related stuff below
 */

// /** We store thunks here for better hot-reloading. */
// let thunkLookup = {};

// const thunkMiddleware = () =>
//   (params) => // params has { dispatch, getState }
//     (next) => // native dispatch
//       (action) => { // received action
//         if ('args' in action && action.type in thunkLookup) {
//           return thunkLookup[action.type](action.args).thunk(
//             { ...params, state: params.getState() },
//             action.args,
//           );
//         }
//         next(action);
//         return;
//       };

// export function updateThunkLookupFromBlobUrl(blobUrl) {
//   return new Promise((resolve) => eval(`
//   import('${blobUrl}').then((imported) => {
//     if ('Thunk' in imported) {
//       thunkLookup = Object.values(imported.Thunk)
//         .reduce((agg, fn) => ({ ...agg, [fn.type]: fn }), {});
//     } else {
//       console.warn("Couldn't find export 'Thunk' of reducer.ts");
//     }
//     resolve();
//   });
// `)
// );
// }

// let store;

// export function initializeRuntimeStore(preloadedState) {
//   // if (store || typeof window === 'undefined') {
//   if (typeof window === 'undefined') {
//     return;
//   }
//   rootReducer = combineReducers({});
//   const composeWithDevTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
//     window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
//       shouldHotReload: false,
//       serialize: {
//         // Handle huge/cyclic objects by redacting them
//         replacer: (_, value) =>
//           value && value.devToolsRedaction
//             ? `Redacted<${value.devToolsRedaction}>`
//             : typeof value === 'function' ? 'Redacted<function>' : value,
//       },
//     }) || compose;
  
//   store = createStore(
//     rootReducer,
//     preloadedState,
//     composeWithDevTools(
//       applyMiddleware(
//         thunkMiddleware(),
//       ),
//     ),
//   );
// }

// export function replaceRootReducerFromBlobUrl(blobUrl) {
//   return new Promise((resolve) => eval(`
//     import('${blobUrl}').then((imported) => {
//       const createRootReducer = imported.default;
//       store.replaceReducer(createRootReducer());
//       resolve();
//     });
//   `)
//   );
// }

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
