import { MiddlewareAPI, Dispatch, createStore, applyMiddleware, Store } from 'redux';
import { persistReducer, createTransform, persistStore } from 'redux-persist';
import storage from 'localforage';
import { composeWithDevTools } from 'remote-redux-devtools';
import { LevelWorkerContext } from '@model/level/level.worker.model';
import { LevelDispatchOverload, LevelThunkAct } from '@model/level/level.redux.model';
import rootReducer, { LevelWorkerAction, LevelWorkerState, LevelWorkerThunk } from './reducer';
import { Redacted, replacer } from '@model/redux.model';
import { LevelState } from '@model/level/level.model';

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
      (state, _key) => ({ ...state }),
      { whitelist: ['level'] },
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
      port: 3002,
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


/**
 * We also create an instance of the store here.
 */
const ctxt: LevelWorkerContext = self as any;
export const store = initializeStore(ctxt);

const persistor = persistStore(
  store as any,
  null,
  () =>  ctxt.postMessage({ key: 'level-worker-ready' }),
);

persistor.pause(); // We save manually

export const getLevel = (levelUid: string) =>
  store.getState().level.instance[levelUid] as LevelState | undefined;
