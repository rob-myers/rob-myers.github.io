import create from 'zustand';
import { devtools } from 'zustand/middleware';
import produce from 'immer';
import { KeyedLookup } from '@model/generic.model';
import * as INode from '@model/inode';
import { TtyWrapper } from '@model/shell/tty.wrapper';
import FileService from '@model/shell/file.service';

export interface State {
  root: INode.DirectoryINode;
  session: KeyedLookup<Session>;
  nextTtyId: number;
  toSessionKey: { [alias: string]: string };
  readonly api: {
  ensureSession: (alias: string) => void;
    file: FileService;
  };
}

interface Session {
  key: string;
  ttyId: number;
  tty: TtyWrapper;
}

const useStore = create<State>(devtools((set, get) => {
  const root = new INode.DirectoryINode({
    userKey: 'root',
    groupKey: 'root',
  }, null);
  return {
    root,
    session: {},
    nextTtyId: 1,
    toSessionKey: {},
    api: {
      ensureSession: (alias) => {
        const { session, nextTtyId: ttyId, api } = get();
        if (session[alias]) {
          return;
        }
        const ttyFilename = `tty-${ttyId}`;
        const sessionKey = `root@${ttyFilename}`;
        const tty = new TtyWrapper(sessionKey, ttyFilename);
        
        api.file.store(tty.inode, tty.canonicalPath);

        set(produce((state: State) => {
          state.nextTtyId++;
          state.toSessionKey[alias] = sessionKey;
          state.session[sessionKey] = {
            key: sessionKey,
            ttyId,
            tty,
          };
        }));
      },
      file: new FileService(root),
    },
  };
}, 'shell'));

export default useStore;
