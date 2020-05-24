import { createStore, applyMiddleware, Dispatch } from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer, { RootState, RootAction } from './reducer';
import { RedactInReduxDevTools } from '@model/redux.model';
import { RootThunkParams, ThunkAct } from '@model/root.redux.model';
import { State as TestState } from '@store/test.duck';
import { State as WorkerState } from '@store/worker.duck';
import { State as GitalkState } from '@store/gitalk.duck';

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
        syntaxWorker: null,
        monacoGlobalsLoaded: false,
        monacoTypesLoaded: false,
        monacoSupportedPkgs: [],
        monacoEditor: {},
        monacoModel: {},
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
  ],
}, rootReducer);

export const initializeStore = (preloadedState?: RootState) =>
  createStore(
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
        thunkMiddleware(),
      )
    )
  );

export type ReduxStore = ReturnType<typeof initializeStore>;
