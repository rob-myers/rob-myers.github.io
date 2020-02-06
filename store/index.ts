import { createStore, applyMiddleware, Dispatch } from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer, { RootState, RootAction } from './reducer';
import { ThunkParams, ThunkAct, RedactInReduxDevTools } from './redux-util';
import { State as TestState } from '@store/test.duck';
import { State as NavState } from '@store/nav.duck';

const thunkMiddleware = () =>
  (params: ThunkParams) =>
    (next: Dispatch) =>
      (action: RootAction | ThunkAct<string, {}, any>) => {
        if ('thunk' in action) {
          return action.thunk(params, action.args);
        }
        next(action);
        return;
      };

const persistedReducer = persistReducer({
  key: 'primary',
  storage,
  transforms: [
    createTransform(
      ({ count }: TestState, _key): TestState => ({
        count,
        lastPing: null
      }),
      (state: TestState, _key): TestState => state,
      { whitelist: ['test'] }
    ),
    createTransform(
      (_state: NavState): NavState => ({ dom: {} }),
      (state: NavState): NavState => state,
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
