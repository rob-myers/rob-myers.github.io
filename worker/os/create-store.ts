import { createStore, applyMiddleware, Dispatch, MiddlewareAPI, Store } from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';
import { persistReducer, createTransform } from 'redux-persist';
import storage from 'localforage';
import rootReducer, { OsWorkerState, OsWorkerAction, OsWorkerThunk } from './reducer';
import { RedactInReduxDevTools, Redacted } from '@model/redux.model';
import { OsThunkAct, OsDispatchOverload } from '@model/os/os.redux.model';
import { State as OsState, initialOsAux } from '@store/os/os.duck';
import { DirectoryINode } from '@store/inode/directory.inode';
import { INode } from '@model/os/file.model';
import { INodeType } from '@store/inode/base-inode';
import { FifoINode } from '@store/inode/fifo.inode';
import { NullINode } from '@store/inode/null.inode';
import { RandomINode } from '@store/inode/random.inode';
import { RegularINode } from '@store/inode/regular.inode';
import { testNever } from '@model/generic.model';
import { Service } from '@service/create-services';
import { OsWorkerContext } from '@model/os/os.worker.model';

const thunkMiddleware =
  (service: Service, worker: OsWorkerContext) =>
    (params: MiddlewareAPI<OsDispatchOverload>) =>
      (next: Dispatch) =>
        (action: OsWorkerAction | OsThunkAct<string, {}, any>) => {
          if ('thunk' in action) {
            return action.thunk({
              ...params,
              state: params.getState(),
              service,
              worker,
            }, action.args);
          }
          next(action);
          return;
        };

const persistedReducer = persistReducer({
  key: 'os-worker',
  storage,
  transforms: [
    createTransform<OsState, OsState>(
      ({ root, user, userGrp }, _key) => {
        // Remove devices to avoid serializing {TtyINode}s.
        const preRoot = { ...root, to: { ...root.to} } as OsState['root'];
        delete preRoot.to.dev;
        
        const transformed: OsState = {
          aux: initialOsAux,
          ofd: {},
          proc: {},
          procGrp: {},
          root: preRoot,
          session: {},
          userGrp,
          user,
        };
        return transformed;
      },
      (state, _key) => ({
        ...state,
        root: rehydrateFilesystem(state.root, null) as DirectoryINode,
      }),
      { whitelist: ['os'] }
    ),
  ],
}, rootReducer);

/**
 * Convert serialized inodes back into {BaseINode} instances.
 */
function rehydrateFilesystem(inode: INode, parent: null | DirectoryINode): INode {
  switch (inode.type) {
    case INodeType.directory: {
      const newNode = new DirectoryINode({ ...inode.def }, parent);
      Object.entries(inode.to).forEach(([filename, child]) => {
        if (child.type !== INodeType.tty) {// Recurse.
          newNode.addChild(filename, rehydrateFilesystem(child, newNode));
        }
      });
      return newNode;
    }
    case INodeType.fifo: {
      return new FifoINode({ ...inode.def });
    }
    case INodeType.null: {
      return new NullINode({ ...inode.def });
    }
    case INodeType.random: {
      return new RandomINode({ ...inode.def });
    }
    case INodeType.regular: {
      return new RegularINode({ ...inode.def }, inode.data.slice());
    }
    case INodeType.tty: {
      throw Error('tty inodes should never be rehydrated');
    }
    case INodeType.voice: {
      throw Error('voice inodes should never be rehydrated');
    }
    default: throw testNever(inode);
  }
}

/** Handle huge/cyclic objects by redacting them. */
const replacer = (_: any, value: RedactInReduxDevTools) => {
  if (value && value.devToolsRedaction) {
    return `Redacted<${value.devToolsRedaction}>`;
  }
  return value;
};

export const initializeStore = (
  service: Service,
  worker: OsWorkerContext,
  preloadedState?: OsWorkerState,
) =>
  createStore(
    // rootReducer,
    persistedReducer,
    preloadedState,
    composeWithDevTools({
      shouldHotReload: true,
      realtime: true,
      port: 3002,
      name: 'os-worker',
      stateSanitizer: (state: OsWorkerState): Redacted<OsWorkerState> => {
        return JSON.parse(JSON.stringify(state, replacer));
      },
      actionSanitizer: (act: OsWorkerAction): Redacted<OsWorkerAction> => {
        return JSON.parse(JSON.stringify(act, replacer));
      },
    })(
      applyMiddleware(
        thunkMiddleware(service, worker),
      )
    )
  ) as any as Store<OsWorkerState, OsWorkerAction | OsWorkerThunk>;

export type ReduxStore = ReturnType<typeof initializeStore>;
