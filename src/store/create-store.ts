import { createStore, applyMiddleware, compose, Store, DeepPartial } from "redux";
import { persistStore, persistReducer, Persistor } from "redux-persist";

import * as localforage from "localforage";
import { createBrowserHistory } from "history";
import { routerMiddleware } from "connected-react-router";
import { composeWithDevTools, EnhancerOptions } from "redux-devtools-extension";

import { RedactInReduxDevTools, thunkMiddleware } from "@src/model/redux.model";
import { ArgumentTypes } from "@src/model/generic.model";
import createRootReducer, { RootState, RootAction } from "./reducer";
import {
  persistTestTransform
  // persistTopDownTransform
} from "./persist-store";
// import { createEpicMiddleware } from "redux-observable";

export const history = createBrowserHistory();

const persistConfig: ArgumentTypes<typeof persistReducer>[0] = {
  key: "root",
  storage: localforage,
  transforms: [
    persistTestTransform
    // persistTopDownTransform
  ],
  // Do not persist router state.
  blacklist: ["router"]
};

const persistedReducer = persistReducer(persistConfig, createRootReducer(history));

/**
 * Avoids error:
 * <Provider> does not support changing `store` on the fly.
 * https://github.com/reduxjs/react-redux/issues/356
 */
let store: Store;
let persistor: Persistor;

export default function configureStore(preloadedState?: RootState) {
  if (store) {
    return { store, persistor };
  }
  // const epicMiddleware = createEpicMiddleware<
  //   Action<any>,
  //   Action<any>,
  //   RootState,
  //   any
  // >();

  store = createStore<RootState, RootAction, any, any>(
    // rootReducer,
    persistedReducer,
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
      // Ignore functions (NOT WORKING).
      function: false
    } as EnhancerOptions["serialize"]
  }) || compose;
