import { replacer, RootThunkParams, ThunkAct } from '@model/store/redux.model';
import { applyMiddleware, createStore, Dispatch } from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import { createEpicMiddleware } from 'redux-observable';
import { createTransform, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { NEXT_REDUX_STORE } from '@public/constants';
import { State as DevEnvState } from './dev-env.duck';
import { State as EditorState } from './editor.duck';
import createRootReducer, { RootAction, rootEpic, RootState, RootThunk, RootActOrThunk, getRootThunks } from './reducer';
import { State as TestState } from './test.duck';
import { mapValues } from '@model/generic.model';
import { getWindow } from '@model/dom.model';

const storeVersion = 0.02;

const createPersistedReducer = () => persistReducer({
  key: 'primary',
  version: storeVersion,
  migrate: async (state, currentVersion) => {
    const prevVersion = state?._persist.version;
    if (prevVersion !== currentVersion) {
      console.warn(`Persisted store version changed from "${prevVersion}" to "${currentVersion}"`);
      return {} as any;
    }
    return state;
  },
  storage,
  transforms: [
    createTransform<TestState, TestState & { lastPing: null }>(
      ({ count }, _key) => ({
        count,
        lastPing: null
      }),
      (state, _key) => state,
      { whitelist: ['test'] }
    ),
    createTransform<EditorState, EditorState>(
      (_, _key) => ({
        editor: {},
        internal: null,
        monacoLoaded: false,
        monacoLoading: false,
        model: {},
        monacoService: null,
        globalTypesLoaded: false,
        sassWorker: null,
        syntaxWorker: null,
      }),
      (state, _key) => state,
      { whitelist: ['editor'] }
    ),
    createTransform<DevEnvState, DevEnvState>(
      ({ file, saved, package: toPackage }, _key) => ({
        appMeta: {},
        appPortal: {},
        flag: {
          initialized: false,
        },
        file: {},
        packagesManifest: null,
        package: {},
        /**
         * Save all files from packages that have been loaded.
         */
        saved: {
          ...saved,
          ...(
            Object.values(toPackage)
              .filter(x => x.loaded)
              .reduce((agg, pkg) => ({
                ...agg,
                [pkg.key]: {
                  ...pkg,
                  file: mapValues(file, ({ key, contents }) => ({
                    key,
                    contents,
                  })),
                },
              }), {} as typeof toPackage)
          ),
        },
      }),
      (state, _key) => state,
      { whitelist: ['devEnv'] },
    ),
  ],
}, createRootReducer());

const epicMiddlewareFactory = () => createEpicMiddleware<
  RootAction | RootThunk,
  RootAction | RootThunk,
  RootState,
  any
>();

export const initializeStore = (preloadedState?: RootState) => {
  const epicMiddleware = epicMiddlewareFactory();

  const store = createStore(
    // rootReducer(),
    createPersistedReducer(),
    preloadedState,
    composeWithDevTools({
      shouldHotReload: false,
      serialize: {
        // Handle huge/cyclic objects by redacting them
        replacer,
      } as EnhancerOptions['serialize']
    })(
      applyMiddleware(
        epicMiddleware,
        createThunkMiddleware(),
      )
    )
  );
  refreshReducersAndThunks();
  epicMiddleware.run(rootEpic());
  return store;
};

export type ReduxStore = ReturnType<typeof initializeStore>;


/** We store thunks here for better hot-reloading. */
let thunkLookup = {} as Record<string, RootThunk[keyof RootThunk]>;

function createThunkMiddleware() {
  return (params: Omit<RootThunkParams, 'state'>) => // params has { dispatch, getState }
    (next: Dispatch) => // native dispatch
      (action: RootActOrThunk) => { // received action
        if ('args' in action && action.type in thunkLookup) {
          return (thunkLookup[action.type] as (args: any) => any)(action.args).thunk(
            { ...params, state: params.getState() },
            action.args,
          );
        }
        next(action);
        return;
      };
}

function refreshReducersAndThunks() {
  thunkLookup = getRootThunks().reduce((agg, fn) => ({ ...agg, [fn.type]: fn }), {});
  const window = getWindow<{ [NEXT_REDUX_STORE]: ReduxStore }>();
  if (window && NEXT_REDUX_STORE in window) {
    window[NEXT_REDUX_STORE].replaceReducer(createPersistedReducer());
  }
}

if (module.hot) {
  module.hot.accept();
  module.hot.addStatusHandler(refreshHandler);
}

function refreshHandler(status: string) {
  // console.log({ status });
  if (status === 'idle') {
    refreshReducersAndThunks();
  }
  module.hot?.removeStatusHandler(refreshHandler);
}
