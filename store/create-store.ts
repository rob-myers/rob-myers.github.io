import { createStore, applyMiddleware, compose, Store, DeepPartial, Reducer } from "redux";
import { createHashHistory, createMemoryHistory } from "history";
import { routerMiddleware } from "connected-react-router";
import { composeWithDevTools, EnhancerOptions } from "redux-devtools-extension";
import { persistStore, persistReducer, Persistor } from "redux-persist";
import * as localforage from "localforage";

import createRootReducer, { RootState, RootAction } from "./reducer";
import { persistTestTransform } from "./persist-store";
import { RedactInReduxDevTools, thunkMiddleware } from "@model/redux.model";
import { PersistPartial } from "redux-persist/es/persistReducer";

/**
 * Router history.
 * - must use `createHashHistory` on foo.github.io
 * - must use `createMemoryHistory` on server.
 */
export const history = process.browser ? createHashHistory({}) : createMemoryHistory({});

/** Persistent storage; on server we use a mock. */
const storage = process.browser
  ? localforage
  : { getItem: async () => null, setItem: async () => null, removeItem: async () => null };

const persistConfig = {
  key: "root",
  storage,
  transforms: [
    persistTestTransform,
    // persistTopDownTransform,
  ],
  blacklist: ["router"], // Do not persist router state.
};

const persistedReducer = persistReducer<RootState, RootAction>(persistConfig, createRootReducer(history));

/**
 * Avoids error: <Provider> does not support changing `store` on the fly.
 * https://github.com/reduxjs/react-redux/issues/356
 */
let store: Store;
let persistor: Persistor;

export default function configureStore(preloadedState?: RootState) {
  if (store) {
    return { store, persistor };
  }

  store = createStore<RootState & PersistPartial, RootAction, any, any>(
    persistedReducer,
    (preloadedState as DeepPartial<RootState>) || {},
    composeEnhancers(
      applyMiddleware(
        thunkMiddleware(),
        // For dispatching history actions.
        routerMiddleware(history)
      )
    )
  );
  persistor = persistStore(store);

  if (module.hot) {
    /**
     * Enable Webpack hot module replacement for reducers.
     * https://github.com/rt2zz/redux-persist/blob/master/docs/hot-module-replacement.md
     */
    module.hot.accept("./reducer", () => {
      const nextRootReducer = require("./reducer").default(history);
      store.replaceReducer(persistReducer(persistConfig, nextRootReducer));
    });
  }

  return { store, persistor };
}

/** Use redux devtools in development, if browser extension exists. */
const composeEnhancers =
  composeWithDevTools({
    shouldHotReload: false,
    maxAge: 50,
    serialize: {
      /** Handle huge/cyclic objects via RedactInReduxDevTools. */
      replacer: (_: any, value: RedactInReduxDevTools) => {
        if (value && value.devToolsRedaction) {
          return `Redacted<${value.devToolsRedaction}>`;
        }
        return value;
      },
      function: false // NOT WORKING?
    } as EnhancerOptions["serialize"]
  }) || compose;
