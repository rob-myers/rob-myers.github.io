import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { KeyedLookup } from 'model/generic.model';
import { Device, makeShellIo, ShellIo, withProcessHandling } from 'model/sh/io/io.model';
import { MessageFromShell, MessageFromXterm } from 'model/sh/tty.model';
import { addToLookup, ReduxUpdater, removeFromLookup, updateLookup } from './store.util';
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
    createProcess: (meta: {
      sessionKey: string;
      ppid: number;
      pgid: number;
      src: string;
      posPositionals?: string[];
    }) => number;
    mutateProcess: (pid: number, mutator: Partial<ProcessMeta> | ((process: ProcessMeta) => void)) => void;
    createFifo: (fifoKey: string, size?: number) => FifoDevice;
    createVarDevice: (sessionKey: string, varName: string) => VarDevice;
    ensurePersisted: (sessionKey: string) => PersistedSession;
    getFunc: (sessionKey: string, funcName: string) => NamedFunction | undefined;
    getFuncs: (sessionKey: string) => NamedFunction[];
    getNextPid: (sessionKey: string) => number;
    getProcess: (pid: number) => ProcessMeta;
    getProcesses: (sessionKey: string, pgid?: number) => ProcessMeta[];
    getPositional: (pid: number, varName: number) => string;
    getVar: (sessionKey: string, varName: string) => any | undefined;
    getVars: (sessionKey: string) => { key: string; value: string }[];
    getSession: (sessionKey: string) => Session;
    persist: (sessionKey: string, data: { history: string[] }) => void;
    removeDevice: (deviceKey: string) => void;
    removeProcess: (pid: number) => void;
    removeSession: (sessionKey: string) => void;
    resolve: (deviceKey: string, pid: number) => Device;
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
  nextPid: number;
}

interface PersistedSession {
  key: string;
  history: string[];
}

export enum ProcessStatus {
  Suspended,
  Running,
  Killed,
}

interface ProcessMeta {
  /** pid */
  key: number;
  ppid: number;
  pgid: number;
  sessionKey: string;
  status: ProcessStatus;
  /** Executed on kill */
  cleanups: (() => void)[];
  /** Executed on suspend */
  onSuspend: null | (() => void);
  /** Executed on resume */
  onResume: null | (() => void);
  src: string;
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

    createProcess: ({ sessionKey, ppid, pgid, src, posPositionals }) => {
      const pid: number = api.getNextPid(sessionKey);
      get().process[pid] = {
        key: pid,
        ppid,
        pgid,
        sessionKey,
        status: ProcessStatus.Running,
        positionals: ['rsrm', ...posPositionals || []],
        cleanups: [],
        onSuspend: null,
        onResume: null,
        src,
      }; // Mutate
      return pid;
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
          nextPid: 0,
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

    getNextPid: (sessionKey) => {
      return get().session[sessionKey].nextPid++;
    },

    getPositional: (pid, varName) => {
      return get().process[pid].positionals[varName] || '';
    },

    getProcess: (pid) => {
      return get().process[pid];
    },

    getProcesses: (sessionKey, pgid) => {
      return Object.values(get().process)
        .filter(Number.isFinite(pgid)
          ? x => x.sessionKey === sessionKey && x.pgid === pgid
          : x => x.sessionKey === sessionKey
        );
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

    removeProcess(pid) {
      delete get().process[pid];
      // get().process[pid].status = ProcessStatus.Killed;
    },

    removeSession: (sessionKey) => set(({ session, device }) => ({
      session: removeFromLookup(sessionKey, session),
      device: removeFromLookup(session[sessionKey].ttyShell.key, device),
    })),

    resolve: (deviceKey, pid) => {
      const device = get().device[deviceKey];
      return withProcessHandling(device, pid);
    },

    setVar: async (sessionKey, varName, varValue) => {
      api.getSession(sessionKey).var[varName] = varValue; // Mutate
    },

    mutateProcess: (pid, mutator) => {// Mutate
      const process = get().process[pid];
      if (typeof mutator === 'function') {
        mutator(process);
      } else {
        Object.assign(process, mutator);
      }
    },

    warn: (sessionKey, msg) => {
      get().session?.[sessionKey].ttyIo.write({ key: 'error', msg });
    },
  },

}), {
  name: 'session',
  version: 3,
  blacklist: ['api', 'device', 'session', 'process'],
  onRehydrateStorage: (_) =>  {
    return () => {
      useSessionStore.setState({ rehydrated: true });
    };
  },
}), 'session'));

const api = useStore.getState().api;
const useSessionStore = Object.assign(useStore, { api });

export default useSessionStore;
