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
import { Service } from '@os-service/create-services';
import { OsWorkerContext } from '@model/os/os.worker.model';
import { HistoryINode } from '@store/inode/history.inode';

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


type SerializableINode = DirectoryINode | RegularINode | HistoryINode;
function isINodeSerializable(inode: INode): inode is SerializableINode {
  return inode.type === INodeType.directory
  || inode.type === INodeType.regular
  || inode.type === INodeType.history;
}
type INodeJson = DirJson | RegJson | HistJson;
type DirJson = Pick<DirectoryINode, 'type' | 'def' | 'to'>;
type RegJson = Pick<RegularINode, 'type' | 'data'>;
type HistJson = Pick<HistoryINode, 'type' | 'history'>;

function serializeFiles(inode: SerializableINode): INodeJson {
  switch (inode.type) {
    case INodeType.directory: return {
      type: INodeType.directory,
      def: inode.def,
      to: Object.entries(inode.to).reduce((agg, [k, v]) => ({
        ...agg,
        ...(isINodeSerializable(v) && { [k]: serializeFiles(v) }),
      }), {}),
    };
    case INodeType.regular: return {
      type: INodeType.regular,
      data: inode.data.slice(),
    };
    case INodeType.history: return {
      type: INodeType.history,
      history: inode.history.slice(),
    };
  }
}

const persistedReducer = persistReducer({
  key: 'os-worker',
  storage,
  transforms: [
    createTransform<OsState, OsState>(
      ({ root, user, userGrp }, _key) => {
        const home = root.to.home as DirectoryINode;
        
        const transformed: OsState = {
          aux: initialOsAux,
          ofd: {},
          proc: {},
          procGrp: {},
          root: {
            type: INodeType.directory,
            def: root.def,
            to: { home: serializeFiles(home) },
          } as unknown as DirectoryINode,
          session: {},
          userGrp,
          user,
        };
        console.log({ transformed });
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
    case INodeType.history: {
      return new HistoryINode({ ...inode.def }, inode.history.slice());
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
      shouldHotReload: false,
      // realtime: true,
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
