import { MiddlewareAPI, Dispatch, createStore, applyMiddleware, Store } from 'redux';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'localforage';
import { composeWithDevTools } from 'remote-redux-devtools';

import { Redacted, replacer } from '@model/store/redux.model';
import { GeomWorkerContext } from '../worker.model';
import { GeomDispatchOverload, GeomThunkAct } from './redux.model';
import rootReducer, { GeomWorkerAction, GeomWorkerState, GeomWorkerThunk } from './reducer';

const thunkMiddleware =
  (worker: GeomWorkerContext) =>
    (params: MiddlewareAPI<GeomDispatchOverload>) =>
      (next: Dispatch) =>
        (action: GeomWorkerAction | GeomThunkAct<string, {}, any>) => {
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
  key: 'geom-worker',
  storage,
  transforms: [
    createTransform<GeomWorkerState['test'], GeomWorkerState['test']>(
      ({ count }, _key): GeomWorkerState['test'] => {
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
  worker: GeomWorkerContext,
  preloadedState?: GeomWorkerState,
) =>
  createStore(
    // rootReducer,
    persistedReducer,
    preloadedState,
    composeWithDevTools({
      shouldHotReload: false,
      realtime: true, // Turned on remote monitoring
      port: 3002,
      name: 'geom-worker',
      stateSanitizer: (state: GeomWorkerState): Redacted<GeomWorkerState> => {
        return JSON.parse(JSON.stringify(state, replacer));
      },
      actionSanitizer: (act: GeomWorkerState): Redacted<GeomWorkerState> => {
        return JSON.parse(JSON.stringify(act, replacer));
      },
    })(
      applyMiddleware(
        thunkMiddleware(worker),
      )
    )
  ) as unknown as Store<GeomWorkerState, GeomWorkerAction | GeomWorkerThunk>;
