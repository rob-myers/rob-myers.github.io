import { createStore, applyMiddleware, Dispatch } from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer, { RootState, RootAction } from './reducer';
import { ThunkParams, ThunkAct, RedactInReduxDevTools } from './redux.model';
import { State as TestState } from '@store/test.duck';
import { State as NavState } from '@store/nav.duck';

const thunkMiddleware = () =>
  (params: Omit<ThunkParams, 'state'>) =>
    (next: Dispatch) =>
      (action: RootAction | ThunkAct<string, {}, any>) => {
        if ('thunk' in action) {
          return action.thunk({
            ...params,
            state: params.getState(),
          }, action.args);
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
    createTransform<NavState, NavState>(
      (_state) => ({
        dom: {},
        webWorker: null,
      }),
      (state) => state,
      { whitelist: ['nav'] }
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
        // Handle huge/cyclic objects by redacting them.
        replacer: (_: any, value: RedactInReduxDevTools) => {
          if (value && value.devToolsRedaction) {
            return `Redacted<${value.devToolsRedaction}>`;
          }
          return value;
        },
        function: false
      } as EnhancerOptions['serialize']
    })(
      applyMiddleware(
        thunkMiddleware(),
      )
    )
  );

export type ReduxStore = ReturnType<typeof initializeStore>;
