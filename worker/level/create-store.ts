import { MiddlewareAPI, Dispatch, createStore, applyMiddleware, Store } from 'redux';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'localforage';
import { LevelWorkerContext } from '@model/level/level.worker.model';
import { LevelDispatchOverload, LevelThunkAct } from '@model/level/level.redux.model';
import rootReducer, { LevelWorkerAction, LevelWorkerState, LevelWorkerThunk } from './reducer';
import { composeWithDevTools } from 'remote-redux-devtools';
import { Redacted, replacer } from '@model/redux.model';

const thunkMiddleware =
  (worker: LevelWorkerContext) =>
    (params: MiddlewareAPI<LevelDispatchOverload>) =>
      (next: Dispatch) =>
        (action: LevelWorkerAction | LevelThunkAct<string, {}, any>) => {
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
  key: 'level-worker',
  storage,
  transforms: [
    createTransform<LevelWorkerState['level'], LevelWorkerState['level']>(
      (_, _key): LevelWorkerState['level'] => {
        return {
          instance: {},
        };
      },
      (state, _key) => ({
        ...state,
      }),
      { whitelist: ['level'] }
    ),
  ],
}, rootReducer);


export const initializeStore = (
  worker: LevelWorkerContext,
  preloadedState?: LevelWorkerState,
) =>
  createStore(
    // rootReducer,
    persistedReducer,
    preloadedState,
    composeWithDevTools({
      shouldHotReload: false,
      // realtime: true,
      port: 3003,
      name: 'level-worker',
      stateSanitizer: (state: LevelWorkerState): Redacted<LevelWorkerState> => {
        return JSON.parse(JSON.stringify(state, replacer));
      },
      actionSanitizer: (act: LevelWorkerAction): Redacted<LevelWorkerAction> => {
        return JSON.parse(JSON.stringify(act, replacer));
      },
    })(
      applyMiddleware(
        thunkMiddleware(worker),
      )
    )
  ) as any as Store<LevelWorkerState, LevelWorkerAction | LevelWorkerThunk>;
