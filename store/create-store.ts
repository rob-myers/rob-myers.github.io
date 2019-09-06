import { createStore, applyMiddleware, compose, Store, DeepPartial } from "redux";
import { createHashHistory, createMemoryHistory } from "history";
import { routerMiddleware } from "connected-react-router";
import { composeWithDevTools, EnhancerOptions } from "redux-devtools-extension";

import { RedactInReduxDevTools, thunkMiddleware } from "@model/redux.model";
// import { ArgumentTypes } from "@model/generic.model";
import createRootReducer, { RootState, RootAction } from "./reducer";

/**
 * On server one must use `createMemoryHistory`.
 */
export const history = process.browser ? createHashHistory({}) : createMemoryHistory({});

const rootReducer = createRootReducer(history);

/**
 * Avoids error: <Provider> does not support changing `store` on the fly.
 * https://github.com/reduxjs/react-redux/issues/356
 */
let store: Store;

export default function configureStore(preloadedState?: RootState) {
  if (store) {
    // return { store, persistor };
    return { store };
  }
  // const epicMiddleware = createEpicMiddleware<
  //   Action<any>,
  //   Action<any>,
  //   RootState,
  //   any
  // >();

  store = createStore<RootState, RootAction, any, any>(
    rootReducer,
    // persistedReducer,
    (preloadedState as DeepPartial<RootState>) || {},
    composeEnhancers(
      applyMiddleware(
        // epicMiddleware,
        thunkMiddleware(),
        // For dispatching history actions.
        routerMiddleware(history)
      )
    )
  );
  // epicMiddleware.run(rootEpic);
  // persistor = persistStore(store);

  if (module.hot) {
    /**
     * Enable Webpack hot module replacement for reducers.
     * https://github.com/rt2zz/redux-persist/blob/master/docs/hot-module-replacement.md
     */
    module.hot.accept("./reducer", () => {
      const nextRootReducer = require("./reducer").default(history);
      // store.replaceReducer(persistReducer(persistConfig, nextRootReducer));
      store.replaceReducer(nextRootReducer);
    });
  }

  // return { store, persistor };
  return { store };
}

/**
 * Use redux devtools in development, if browser extension exists.
 */
const composeEnhancers =
  composeWithDevTools({
    shouldHotReload: false,
    maxAge: 50,
    serialize: {
      /**
       * Handle huge/cyclic objects via RedactInReduxDevTools.
       */
      replacer: (_: any, value: RedactInReduxDevTools) => {
        if (value && value.devToolsRedaction) {
          return `Redacted<${value.devToolsRedaction}>`;
        }
        return value;
      },
      function: false // NOT WORKING?
    } as EnhancerOptions["serialize"]
  }) || compose;
