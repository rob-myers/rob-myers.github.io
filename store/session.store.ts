import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { KeyedLookup } from 'model/generic.model';
import { Device, makeShellIo, ShellIo, withProcessHandling } from 'model/sh/io/io.model';
import { MessageFromShell, MessageFromXterm } from 'model/sh/tty.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import { TtyShell } from 'model/sh/tty.shell';
import { NamedFunction } from 'model/sh/var.model';
import { FifoDevice } from 'model/sh/io/fifo.device';
import { VarDevice } from 'model/sh/io/var.device';
import { FileWithMeta } from 'model/sh/parse/parse.model';
import { srcService } from 'model/sh/parse/src.service';
import { NullDevice } from 'model/sh/io/null.device';

export type State = {
  session: KeyedLookup<Session>;
  device: KeyedLookup<Device>;
  /** Always mutated */
  process: KeyedLookup<ProcessMeta>;
  persist: KeyedLookup<PersistedSession>;
  rehydrated: boolean;
  
  readonly api: {
    addFunc: (sessionKey: string, funcName: string, wrappedFile: FileWithMeta) => void;
    createSession: (sessionKey: string) => void;
    createProcess: (processKey: string, sessionKey: string) => void;
    updateProcess: (processKey: string, updates: Partial<ProcessMeta>) => void;
    createFifo: (fifoKey: string, size?: number) => FifoDevice;
    createVarDevice: (sessionKey: string, varName: string) => VarDevice;
    ensurePersisted: (sessionKey: string) => PersistedSession;
    getFunc: (sessionKey: string, funcName: string) => NamedFunction | undefined;
    getFuncs: (sessionKey: string) => NamedFunction[];
    getVar: (sessionKey: string, varName: string) => any | undefined;
    getVars: (sessionKey: string) => { key: string; value: string }[];
    getSession: (sessionKey: string) => Session;
    persist: (sessionKey: string, data: { history: string[] }) => void;
    removeDevice: (deviceKey: string) => void;
    removeProcess: (processKey: string) => void;
    removeSession: (sessionKey: string) => void;
    resolve: (deviceKey: string, processKey: string) => Device;
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

interface ProcessMeta {
  key: string;
  sessionKey: string;
  status: 'running' | 'suspended' | 'interrupted' | 'killed';
  positionals: string[];
}

const useStore = create<State>(devtools(persist((set, get) => ({
  device: {},
  session: {},
  process: {},
  persist: {},
  rehydrated: false,

  api: {
    addFunc: (sessionKey, funcName, file) => {
      set(({ session }) => ({
        session: updateLookup(sessionKey, session, ({ func }) => ({
          func: addToLookup({
            key: funcName,
            node: file,
            src: srcService.multilineSrc(file),
          }, func),
        }))
      }));
    },

    createFifo(key, size) {
      const fifo = new FifoDevice(key, size);
      set(({ device }) => ({ device: addToLookup(fifo, device) }));
      return fifo;
    },

    createProcess: (processKey, sessionKey) => {
      get().process[processKey] = {
        key: processKey,
        sessionKey,
        status: 'running',
        positionals: [],
      }; // Mutate
    },

    createSession: (sessionKey) => {
      const persisted = api.ensurePersisted(sessionKey);
      const ttyIo = makeShellIo<MessageFromXterm, MessageFromShell>();
      const ttyShell = new TtyShell(sessionKey, ttyIo, persisted.history);
      const ttyDevice: Device = ttyShell;
      const nullDevice = new NullDevice('/dev/null');

      set(({ session, device }) => ({
        session: addToLookup({
          key: sessionKey,
          func: {},
          ttyIo,
          ttyShell,
          var: {},
        }, session),
        device: addToLookup(nullDevice, addToLookup(ttyDevice, device)),
      }));
    },

    createVarDevice(sessionKey, varName) {
      const varDevice = new VarDevice(sessionKey, varName);
      set(({ device }) => ({ device: addToLookup(varDevice, device) }));
      return varDevice;
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

    removeDevice(deviceKey) {
      set(({ device }) => ({ device: removeFromLookup(deviceKey, device), }));
    },

    removeProcess(processKey) {
      delete get().process[processKey];
    },

    removeSession: (sessionKey) => set(({ session, device }) => ({
      session: removeFromLookup(sessionKey, session),
      device: removeFromLookup(session[sessionKey].ttyShell.key, device),
    })),

    resolve: (deviceKey, processKey) => {
      const device = get().device[deviceKey];
      return withProcessHandling(device, processKey);
    },

    setVar: async (sessionKey, varName, varValue) => {
      api.getSession(sessionKey).var[varName] = varValue; // Mutate
    },

    updateProcess: (processKey, updates) => {
      Object.assign(get().process[processKey], updates); // Mutate
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
