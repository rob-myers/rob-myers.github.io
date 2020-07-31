import { SavedProject } from '@model/dev-env/dev-env.model';
import { replacer, RootThunkParams } from '@model/store/redux.model';
import { applyMiddleware, createStore, Dispatch } from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import { createEpicMiddleware } from 'redux-observable';
import { createTransform, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { State as DevEnvState } from './dev-env.duck';
import { State as EditorState } from './editor.duck';
import rootReducer, { RootAction, RootActOrThunk, rootEpic, RootState, RootThunk, RootThunks } from './reducer';
import { State as TestState } from './test.duck';
import { mapValues } from '@model/generic.model';



const storeVersion = 0.01;

const persistedReducer = persistReducer({
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
        appPortal: {},
        flag: {
          appValid: false,
          appWasValid: false,
          initialized: false,
          reducerValid: false,
        },
        file: {},
        packagesManifest: null,
        panelOpener: null,
        panelToMeta: {},
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
}, rootReducer());

const epicMiddlewareFactory = () => createEpicMiddleware<
  RootAction | RootThunk,
  RootAction | RootThunk,
  RootState,
  any
>();

export const initializeStore = (preloadedState?: RootState) => {
  const epicMiddleware = epicMiddlewareFactory();

  const store = createStore(
    // rootReducer,
    persistedReducer,
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
        thunkMiddleware(),
      )
    )
  );
  loadThunkLookup();
  epicMiddleware.run(rootEpic());
  return store;
};

export type ReduxStore = ReturnType<typeof initializeStore>;

/** We store thunks here for better hot-reloading. */
let thunkLookup = {} as Record<string, RootThunk[keyof RootThunk]>;

function thunkMiddleware() {
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

function loadThunkLookup() {
  thunkLookup = RootThunks.reduce((agg, fn) => ({ ...agg, [fn.type]: fn }), {});
}

module.hot?.accept(() => {
  console.log('reloading thunk lookup...')
  loadThunkLookup();
});
