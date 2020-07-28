import { createStore, applyMiddleware, Dispatch } from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createEpicMiddleware } from 'redux-observable';

import { RedactInReduxDevTools } from '@model/store/redux.model';
import { RootThunkParams, ThunkAct } from '@model/store/root.redux.model';

import { State as TestState } from './test.duck';
import { State as EditorState } from './editor.duck';
import { State as LayoutState } from './layout.duck';
import { State as DevEnvState } from './dev-env.duck';
import rootReducer, { RootState, RootAction, rootEpic, RootThunk } from './reducer';
import { getDefaultProjectLayout, getDefaultEmptyLayout } from '@model/layout/generate-layout';
import { SavedProject } from '@model/dev-env/dev-env.model';

const storeVersion = 0.34;

const thunkMiddleware = () =>
  (params: Omit<RootThunkParams, 'state'>) =>
    (next: Dispatch) =>
      (action: RootAction | ThunkAct<string, {}, any>) => {
        if ('thunk' in action) {
          return action.thunk({ ...params, state: params.getState() }, action.args);
        }
        next(action);
        return;
      };

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
    createTransform<LayoutState, LayoutState>(
      ({ goldenLayout, savedConfig, persistKey }, _key) => {
        const nextConfig = persistKey
          ? goldenLayout?.toConfig() || getDefaultProjectLayout()
          : getDefaultEmptyLayout();
        return {
          savedConfig: persistKey
            ? { ...savedConfig, [persistKey]: { key: persistKey, config: nextConfig } }
            : savedConfig,
          goldenLayout: null,
          nextConfig,
          panel: {},
          persistKey,
        };
      },
      (state, _key) => state,
      { whitelist: ['layout'] },
    ),
    createTransform<DevEnvState, DevEnvState>(
      ({ file, projectKey, saved }, _key) => ({
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
        projectKey,
        /**
         * Remember files in current project and also
         * previously saved projects.
         */
        saved: {
          ...saved,
          ...(projectKey && { [projectKey]: {
              key: projectKey,
              file: Object.values(file)
                .filter(x => !x.key.startsWith('package/'))
                .reduce((agg, item) => ({
                  ...agg, [item.key]: {
                    key: item.key,
                    contents: item.contents,
                  },
                }), {} as SavedProject),
            }
          }),
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
        replacer: (_: any, value: RedactInReduxDevTools) =>
          value && value.devToolsRedaction
            ? `Redacted<${value.devToolsRedaction}>`
            : typeof value === 'function' ? 'Redacted<function>' : value,
      } as EnhancerOptions['serialize']
    })(
      applyMiddleware(
        epicMiddleware,
        thunkMiddleware(),
      )
    )
  );
  epicMiddleware.run(rootEpic());
  return store;
};

export type ReduxStore = ReturnType<typeof initializeStore>;
