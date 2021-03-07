import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { KeyedLookup } from 'model/generic.model';
import { Device, makeShellIo, ShellIo } from 'model/sh/io/io.model';
import { MessageFromShell, MessageFromXterm } from 'model/sh/tty.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import { TtyShell } from 'model/sh/tty.shell';
import { NamedFunction } from 'model/sh/var.model';
import { FifoDevice } from 'model/sh/io/fifo.device';
import { VarDevice } from 'model/sh/io/var.device';
import { FileWithMeta } from 'model/sh/parse.model';
import { srcService } from 'model/sh/src.service';

export type State = {
  session: KeyedLookup<Session>;
  device: KeyedLookup<Device>;
  persist: KeyedLookup<PersistedSession>;
  rehydrated: boolean;
  
  readonly api: {
    addFunc: (sessionKey: string, funcName: string, wrappedFile: FileWithMeta) => void;
    createSession: (sessionKey: string) => void;
    createFifo: (fifoKey: string, size?: number) => FifoDevice;
    createVarDevice: (sessionKey: string, varName: string) => VarDevice;
    ensurePersisted: (sessionKey: string) => PersistedSession;
    getFunc: (sessionKey: string, funcName: string) => NamedFunction | undefined;
    getFuncs: (sessionKey: string) => NamedFunction[];
    getVar: (sessionKey: string, varName: string) => any | undefined;
    getVars: (sessionKey: string) => { key: string; value: string }[];
    getSession: (sessionKey: string) => Session;
    persist: (sessionKey: string, data: { history: string[] }) => void;
    removeFifo: (fifoKey: string) => void;
    removeSession: (sessionKey: string) => void;
    resolve: (deviceKey: string) => Device;
    setVar: (sessionKey: string, varName: string, varValue: any) => void;
    warn: (sessionKey: string, msg: string) => void;
  }
}

interface Session {
  key: string;
  func: KeyedLookup<NamedFunction>;
  ttyIo: ShellIo<MessageFromXterm, MessageFromShell>;
  ttyShell: TtyShell,
  var: Record<string, any>;
}

interface PersistedSession {
  key: string;
  history: string[];
}

const useStore = create<State>(devtools(persist((set, get) => ({
  device: {},
  session: {},
  persist: {},
  rehydrated: false,

  api: {
    addFunc: (sessionKey, funcName, file) => {
      set(({ session }) => ({
        session: updateLookup(sessionKey, session, ({ func }) => ({
          func: addToLookup({
            key: funcName,
            node: file,
            src: srcService.src(file),
          }, func),
        }))
      }));
    },

    createFifo(key, size) {
      const fifo = new FifoDevice(key, size);
      set(({ device }) => ({ device: addToLookup(fifo, device) }));
      return fifo;
    },

    createVarDevice(sessionKey, varName) {
      const varDevice = new VarDevice(sessionKey, varName);
      set(({ device }) => ({ device: addToLookup(varDevice, device) }));
      return varDevice;
    },

    createSession: (sessionKey) => {
      const persisted = api.ensurePersisted(sessionKey);
      const ttyIo = makeShellIo<MessageFromXterm, MessageFromShell>();
      const ttyShell = new TtyShell(sessionKey, ttyIo, persisted.history);
      const ttyDevice: Device = ttyShell;

      set(({ session, device }) => ({
        session: addToLookup({
          key: sessionKey,
          func: {},
          ttyIo,
          ttyShell,
          var: {},
        }, session),
        device: addToLookup(ttyDevice, device),
      }));
    },

    ensurePersisted: (sessionKey) => {
      const newItem: PersistedSession = { key: sessionKey, history: [] };
      const persisted = get().persist?.[sessionKey]??newItem
      set(({ persist: lookup }) => ({ persist: addToLookup(persisted, lookup) }));
      return persisted;
    },

    getFunc: (sessionKey, funcName) => {
      return get().session[sessionKey].func[funcName] || undefined;
    },

    getFuncs: (sessionKey) => {
      return Object.values(get().session[sessionKey].func);
    },

    getVar: (sessionKey, varName) => {
      return get().session[sessionKey].var[varName] || undefined;
    },

    getVars: (sessionKey) => {
      return Object.entries(get().session[sessionKey].var)
        .map(([key, value]) => ({ key, value }));
    },

    getSession: (sessionKey) =>
      get().session[sessionKey],

    persist: (sessionKey, { history }) => set(({ persist: persisted }) => ({
      persist: updateLookup(sessionKey, persisted, () => ({
        history,
      })),
    })),

    removeFifo(fifoKey) {
      set(({ device }) => ({ device: removeFromLookup(fifoKey, device), }));
    },

    removeSession: (sessionKey) => set(({ session, device }) => ({
      session: removeFromLookup(sessionKey, session),
      device: removeFromLookup(session[sessionKey].ttyShell.key, device),
    })),

    resolve: (deviceKey) => get().device[deviceKey],

    setVar: async (sessionKey, varName, varValue) => {
      api.getSession(sessionKey).var[varName] = varValue; // Mutate
    },

    warn: (sessionKey, msg) => {
      get().session?.[sessionKey].ttyIo.write({ key: 'error', msg });
    },
  },

}), {
  name: 'session',
  version: 2,
  blacklist: ['api', 'device', 'session'],
  onRehydrateStorage: (_) =>  {
    return () => {
      useSessionStore.setState({ rehydrated: true });
    };
  },
}), 'session'));

const api = useStore.getState().api;
const useSessionStore = Object.assign(useStore, { api });

export default useSessionStore;
