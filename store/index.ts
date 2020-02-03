import { createStore, applyMiddleware, Dispatch } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
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

export const initializeStore = (preloadedState?: RootState) =>
  createStore(
    rootReducer,
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
