import { applyMiddleware, createStore, Dispatch } from 'redux';
import { composeWithDevTools, EnhancerOptions } from 'redux-devtools-extension';
import { createEpicMiddleware } from 'redux-observable';
import { createTransform, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { getWindow } from '@model/dom.model';
import { replacer, RootThunkParams } from '@model/store/redux.model';
import { GeomService } from '@model/geom/geom.service';
import { NEXT_REDUX_STORE } from '@public/constants';

import * as Reducer from './reducer';
import createRootReducer from './reducer';
import { State as BipartiteState } from './bipartite.duck';
import { State as BlogState } from './blog.duck';
import { State as TestState } from './test.duck';
import { State as GeomState } from './geom.duck';

const storeVersion = 0.03;

const createPersistedReducer = () => persistReducer({
  key: 'primary',
  version: storeVersion,
  migrate: async (state, currentVersion) => {
    const prevVersion = state?._persist.version;
    if (prevVersion !== currentVersion) {
      console.warn(`Persisted store version changed from "${prevVersion}" to "${currentVersion}"`);
      return {} as any;
    }
    return state;
  },
  storage,
  transforms: [
    createTransform<BipartiteState, BipartiteState>(
      (_, _key) => ({
        // Empty
      }),
      (state, _key) => state,
      { whitelist: ['bipartite'] }
    ),
    createTransform<BlogState, BlogState>(
      (_, _key) => ({
        portal: {},
      }),
      (state, _key) => state,
      { whitelist: ['blog'] }
    ),
    createTransform<GeomState, Omit<GeomState, 'service'>>(
      ({}, _key) => ({
        // Forget service
      }),
      (state, _key) => ({
        ...state,
        service: new GeomService,
      }),
      { whitelist: ['geom'] }
    ),
    createTransform<TestState, TestState & { lastPing: null }>(
      ({ count }, _key) => ({
        count,
        lastPing: null
      }),
      (state, _key) => state,
      { whitelist: ['test'] }
    ),
  ],
}, createRootReducer());

const epicMiddlewareFactory = () => createEpicMiddleware<
  Reducer.RootAction | Reducer.RootThunk,
  Reducer.RootAction | Reducer.RootThunk,
  Reducer.RootState,
  any
>();

export const initializeStore = (preloadedState?: Reducer.RootState) => {
  const epicMiddleware = epicMiddlewareFactory();

  const store = createStore(
    // rootReducer(),
    createPersistedReducer(),
    preloadedState,
    composeWithDevTools({
      shouldHotReload: false,
      maxAge: 200,
      serialize: {
        // Handle huge/cyclic objects by redacting them
        replacer,
      } as EnhancerOptions['serialize']
    })(
      applyMiddleware(
        epicMiddleware,
        createThunkMiddleware(),
      )
    )
  );
  refreshReducersAndThunks();
  epicMiddleware.run(Reducer.rootEpic() as any); // TEMP any
  return store;
};

export type ReduxStore = ReturnType<typeof initializeStore>;


/** We store thunks here for better hot-reloading. */
let thunkLookup = {} as Record<
  string,
  Reducer.RootThunk[keyof Reducer.RootThunk]
>;

function createThunkMiddleware() {
  return (params: Omit<RootThunkParams, 'state'>) => // params has { dispatch, getState }
    (next: Dispatch) => // native dispatch
      (action: Reducer.RootActOrThunk) => { // received action
        if ('args' in action && action.type in thunkLookup) {
          return (thunkLookup[action.type] as (args: any) => any)(action.args).thunk(
            { ...params, state: params.getState() },
            action.args,
          );
        }
        next(action);
        return;
      };
}

function refreshReducersAndThunks() {
  thunkLookup = Reducer.getRootThunks().reduce((agg, fn) => ({ ...agg, [fn.type]: fn }), {});
  const window = getWindow<{ [NEXT_REDUX_STORE]: ReduxStore }>();
  if (window && NEXT_REDUX_STORE in window) {
    window[NEXT_REDUX_STORE].replaceReducer(createPersistedReducer());
  }
}

function refreshHandler(status: string) {
  // console.log({ status });
  if (status === 'idle') {
    refreshReducersAndThunks();
  }
  module.hot?.removeStatusHandler(refreshHandler);
}

if (module.hot) {
  module.hot.accept();
  module.hot.addStatusHandler(refreshHandler);
}
