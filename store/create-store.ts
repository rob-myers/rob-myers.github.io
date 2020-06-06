import { createStore, applyMiddleware, Dispatch } from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { createEpicMiddleware } from 'redux-observable';

import { RedactInReduxDevTools } from '@model/store/redux.model';
import { RootThunkParams, ThunkAct } from '@model/store/root.redux.model';

import rootReducer, { RootState, RootAction, rootEpic, RootThunk } from './reducer';
import { State as TestState } from '@store/test.duck';
import { State as WorkerState } from '@store/worker.duck';
import { State as GitalkState } from '@store/gitalk.duck';
import { State as LayoutState } from '@store/layout.duck';

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
    createTransform<WorkerState, WorkerState>(
      (_, _key) => ({
        hasTranspiled: false,
        monacoEditor: {},
        monacoInternal: null,
        monacoModel: {},
        monacoService: null,
        monacoTypesLoaded: false,
        sassWorker: null,
        syntaxWorker: null,
      }),
      (state, _key) => state,
      { whitelist: ['worker'] }
    ),
    createTransform<GitalkState, GitalkState>(
      (_, _key) => ({
        user: null,
        errorMsg: null,
        status: 'initial',
        issue: {},
      }),
      (state, _key) => state,
      { whitelist: ['gitalk'] }
    ),
    createTransform<LayoutState, LayoutState>(
      ({ goldenLayout, initConfig }, _key) => ({
        goldenLayout: null,
        initConfig: goldenLayout ? goldenLayout.toConfig() : initConfig,
        panel: {},
      }),
      (state, _key) => state,
      { whitelist: ['layout'] }
    ),
  ],
}, rootReducer);

const epicMiddleware = createEpicMiddleware<RootAction | RootThunk, RootAction | RootThunk, RootState, any>();

export const initializeStore = (preloadedState?: RootState) => {
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
            : value,
        function: false
      } as EnhancerOptions['serialize']
    })(
      applyMiddleware(
        epicMiddleware,
        thunkMiddleware(),
      )
    )
  );
  epicMiddleware.run(rootEpic);
  return store;
};

export type ReduxStore = ReturnType<typeof initializeStore>;
