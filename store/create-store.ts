import { createStore, applyMiddleware, Dispatch } from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer, { RootState, RootAction } from './reducer';
import { RedactInReduxDevTools } from '@model/redux.model';
import { RootThunkParams, ThunkAct } from '@model/root.redux.model';
import { State as TestState } from '@store/test.duck';
import { State as NavState } from '@store/nav.duck';
import { State as XTermState } from '@store/xterm.duck';
import { State as LevelState } from '@store/level.duck';

const thunkMiddleware = () =>
  (params: Omit<RootThunkParams, 'state'>) =>
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
    /**
     * TODO remove
     */
    createTransform<NavState, NavState>(
      (_state): NavState => ({
        dom: {},
        domMeta: {},
        webWorker: null,
        ready: false,
      }),
      (state) => state,
      { whitelist: ['nav'] }
    ),
    createTransform<XTermState, XTermState>(
      (_state): XTermState => ({
        instance: {},
        worker: null,
        voice: null,
        status: 'initial',
      }),
      (state) => state,
      { whitelist: ['xterm'] }
    ),
    createTransform<LevelState, LevelState>(
      (_state): LevelState => ({
        worker: null,
        status: 'initial',
      }),
      (state) => state,
      { whitelist: ['level'] }
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
