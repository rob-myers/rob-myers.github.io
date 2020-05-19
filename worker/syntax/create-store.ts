import { MiddlewareAPI, Dispatch, createStore, applyMiddleware, Store } from 'redux';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'localforage';
import { composeWithDevTools } from 'remote-redux-devtools';
import { Redacted, replacer } from '@model/redux.model';
import { SyntaxWorkerContext } from './worker.model';
import { SyntaxDispatchOverload, SyntaxThunkAct } from './redux.model';
import rootReducer, { SyntaxWorkerAction, SyntaxWorkerState, SyntaxWorkerThunk } from './reducer';

const thunkMiddleware =
  (worker: SyntaxWorkerContext) =>
    (params: MiddlewareAPI<SyntaxDispatchOverload>) =>
      (next: Dispatch) =>
        (action: SyntaxWorkerAction | SyntaxThunkAct<string, {}, any>) => {
          if ('thunk' in action) {
            return action.thunk({
              ...params,
              state: params.getState(),
              worker,
            }, action.args);
          }
          next(action);
          return;
        };

const persistedReducer = persistReducer({
  key: 'syntax-worker',
  storage,
  transforms: [
    createTransform<SyntaxWorkerState['test'], SyntaxWorkerState['test']>(
      ({ count }, _key): SyntaxWorkerState['test'] => {
        return {
          count,
        };
      },
      (state, _key) => ({ ...state }),
      { whitelist: ['test'] },
    ),
  ],
}, rootReducer);


export const initializeStore = (
  worker: SyntaxWorkerContext,
  preloadedState?: SyntaxWorkerState,
) =>
  createStore(
    // rootReducer,
    persistedReducer,
    preloadedState,
    composeWithDevTools({
      shouldHotReload: false,
      // realtime: true,
      port: 3002,
      name: 'syntax-worker',
      stateSanitizer: (state: SyntaxWorkerState): Redacted<SyntaxWorkerState> => {
        return JSON.parse(JSON.stringify(state, replacer));
      },
      actionSanitizer: (act: SyntaxWorkerState): Redacted<SyntaxWorkerState> => {
        return JSON.parse(JSON.stringify(act, replacer));
      },
    })(
      applyMiddleware(
        thunkMiddleware(worker),
      )
    )
  ) as unknown as Store<SyntaxWorkerState, SyntaxWorkerAction | SyntaxWorkerThunk>;
