import create from 'zustand';
import { devtools } from 'zustand/middleware';
import produce from 'immer';
import { KeyedLookup } from '@model/generic.model';
import * as INode from '@model/inode';
import { TtyWrapper } from '@model/shell/tty.wrapper';
import FileService from '@model/shell/file.service';
import { Subscription } from 'rxjs';
import ProcessService from '@model/shell/process.service';

export interface State {
  /** Root of filesystem */
  root: INode.DirectoryINode;
  /** Each terminal connects to a session */
  session: KeyedLookup<Session>;
  /** Next tty identifier, inducing e.g. tty-2 */
  nextTtyId: number;
  /** Sessions are aliased */
  toSessionKey: { [alias: string]: string };

  readonly api: {
    ensureSession: (alias: string) => void;
    file: FileService;
    /** Useful e.g. to track external state changes in devtools */
    set: (delta: ((current: State) => void)) => void;
  };
}

export interface Session {
  key: string;
  ttyId: number;
  tty: TtyWrapper;
  /** Next process id in this session */
  nextProcId: number;
  process: KeyedLookup<Process>;
  service: ProcessService;
}

interface Process {
  key: string;
  sub: Subscription;
}

const useStore = create<State>(devtools((set, get) => {
  const root = new INode.DirectoryINode(
    { userKey: 'root', groupKey: 'root'}, 
    null,
  );
  const file = new FileService(root);

  return {
    root,
    session: {},
    nextTtyId: 1,
    toSessionKey: {},
    api: {
      ensureSession: (alias) => {
        const { toSessionKey, nextTtyId: ttyId } = get();
        if (toSessionKey[alias]) {
          return;
        }
        const ttyFilename = `tty-${ttyId}`;
        const sessionKey = `root@${ttyFilename}`;
        const tty = new TtyWrapper(sessionKey, ttyFilename);
        
        file.store(tty.inode, tty.canonicalPath);
        file.store(tty.inode.def.historyINode, '/root/.history');

        const service = new ProcessService(
          sessionKey,
          tty.inode,
          file,
        );

        set(produce((state: State) => {
          state.nextTtyId++;
          state.toSessionKey[alias] = sessionKey;
          state.session[sessionKey] = {
            key: sessionKey,
            ttyId,
            tty,
            nextProcId: 1,
            process: {},
            service,
          };
        }));

        service.createSessionLeader();
      },
      file,
      set: (delta) => set(produce(delta)),
    },
  };
}, 'shell'));

export default useStore;
