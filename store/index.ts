import { createStore, applyMiddleware, Dispatch } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer, { RootState, RootAction } from './reducer';
import { ThunkParams, ThunkAct } from './redux-util';

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
  whitelist: ['test'],
}, rootReducer);

export const initializeStore = (preloadedState?: RootState) =>
  createStore(
    // rootReducer,
    persistedReducer,
    preloadedState,
    composeWithDevTools({
      shouldHotReload: false,
    })(
      applyMiddleware(
        thunkMiddleware(),
      )
    )
  );

export type ReduxStore = ReturnType<typeof initializeStore>;
