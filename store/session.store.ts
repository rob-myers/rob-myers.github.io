import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { deepClone, KeyedLookup } from 'model/generic.model';
import { Device, makeShellIo, ShellIo } from 'model/sh/io/io.model';
import { MessageFromShell, MessageFromXterm } from 'model/sh/tty.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import { TtyShell } from 'model/sh/tty.shell';
import { NamedFunction } from 'model/sh/var.model';
import { FifoDevice } from 'model/sh/io/fifo.device';
import { VarDevice, VarDeviceMode } from 'model/sh/io/var.device';
import { BaseMeta, FileWithMeta } from 'model/sh/parse/parse.model';
import { srcService } from 'model/sh/parse/src.service';
import { NullDevice } from 'model/sh/io/null.device';

export type State = {
  session: KeyedLookup<Session>;
  device: KeyedLookup<Device>;
  persist: KeyedLookup<PersistedSession>;
  rehydrated: boolean;
  
  readonly api: {
    addCleanup: (meta: BaseMeta, ...cleanups: (() => void)[]) => void;
    addFunc: (sessionKey: string, funcName: string, wrappedFile: FileWithMeta) => void;
    createSession: (sessionKey: string, env: Record<string, any>) => Session;
    createProcess: (def: {
      sessionKey: string;
      ppid: number;
      pgid: number;
      src: string;
      posPositionals?: string[];
    }) => ProcessMeta;
    createFifo: (fifoKey: string, size?: number) => FifoDevice;
    createVarDevice: (sessionKey: string, varName: string, mode: VarDeviceMode) => VarDevice;
    ensureSession: (sessionKey: string, env: Record<string, any>) => Session;
    ensurePersisted: (sessionKey: string) => PersistedSession;
    getFunc: (sessionKey: string, funcName: string) => NamedFunction | undefined;
    getFuncs: (sessionKey: string) => NamedFunction[];
    getNextPid: (sessionKey: string) => number;
    getProcess: (meta: BaseMeta) => ProcessMeta;
    getProcesses: (sessionKey: string, pgid?: number) => ProcessMeta[];
    getPositional: (pid: number, sessionKey: string, varName: number) => string;
    getVar: (sessionKey: string, varName: string) => any | undefined;
    getVars: (sessionKey: string) => { key: string; value: string }[];
    getSession: (sessionKey: string) => Session;
    persist: (sessionKey: string, data: { history: string[] }) => void;
    removeDevice: (deviceKey: string) => void;
    removeProcess: (pid: number, sessionKey: string) => void;
    removeSession: (sessionKey: string) => void;
    resolve: (fd: number, meta: BaseMeta) => Device;
    setVar: (sessionKey: string, varName: string, varValue: any) => void;
    warn: (sessionKey: string, msg: string) => void;
  }
}

export interface Session {
  key: string;
  func: KeyedLookup<NamedFunction>;
  ttyIo: ShellIo<MessageFromXterm, MessageFromShell>;
  ttyShell: TtyShell,
  var: Record<string, any>;
  nextPid: number;
  process: KeyedLookup<ProcessMeta>;
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

export interface ProcessMeta {
  /** pid */
  key: number;
  ppid: number;
  pgid: number;
  sessionKey: string;
  status: ProcessStatus;
  src: string;
  /** Each executed on kill */
  cleanups: (() => void)[];
  /** Executed on suspend */
  onSuspend: null | (() => void);
  /** Executed on resume */
  onResume: null | (() => void);
  positionals: string[];
}

const useStore = create<State>(devtools(persist((set, get) => ({
  device: {},
  session: {},
  persist: {},
  rehydrated: false,

  api: {
    addCleanup: (meta, ...cleanups) => {
      api.getProcess(meta).cleanups.push(...cleanups);
    },

    addFunc: (sessionKey, funcName, file) => {
      api.getSession(sessionKey).func[funcName] = {
        key: funcName,
        node: file,
        src: srcService.multilineSrc(file),
      };
    },

    createFifo(key, size) {
      const fifo = new FifoDevice(key, size);
      return get().device[fifo.key] = fifo;
    },

    createProcess: ({ sessionKey, ppid, pgid, src, posPositionals }) => {
      const pid = get().api.getNextPid(sessionKey);
      const processes = get().api.getSession(sessionKey).process;
      processes[pid] = {
        key: pid,
        ppid,
        pgid,
        sessionKey,
        status: ProcessStatus.Running,
        src,
        positionals: ['3-cli', ...posPositionals || []],
        cleanups: [],
        onSuspend: null,
        onResume: null,
      };
      return processes[pid];
    },

    createSession: (sessionKey, env) => {
      const persisted = api.ensurePersisted(sessionKey);
      const ttyIo = makeShellIo<MessageFromXterm, MessageFromShell>();
      const ttyShell = new TtyShell(sessionKey, ttyIo, persisted.history);
      get().device[ttyShell.key] = ttyShell;
      get().device['/dev/null'] = new NullDevice('/dev/null');

      set(({ session }) => ({
        session: addToLookup({
          key: sessionKey,
          func: {},
          nextPid: 0,
          process: {},
          ttyIo,
          ttyShell,
          var: deepClone(env),
        }, session),
      }));
      return get().session[sessionKey];
    },

    createVarDevice(sessionKey, varName, mode) {
      const varDevice = new VarDevice(sessionKey, varName, mode);
      return get().device[varDevice.key] = varDevice;
    },

    ensureSession: (sessionKey, env) => {
      const { session } = get();
      return session[sessionKey] = session[sessionKey]
        || get().api.createSession(sessionKey, env);
    },

    ensurePersisted: (sessionKey) => {
      const persisted = get().persist?.[sessionKey]??{ key: sessionKey, history: [] };
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

    getPositional: (pid, sessionKey, varName) => {
      return get().session[sessionKey].process[pid].positionals[varName] || '';
    },

    getProcess: ({ pid, sessionKey }) => {
      return get().session[sessionKey].process[pid];
    },

    getProcesses: (sessionKey, pgid) => {
      const processes = Object.values(get().session[sessionKey].process);
      return pgid === undefined ? processes : processes.filter(x => x.pgid === pgid);
    },

    getVar: (sessionKey, varName) => {
      return get().session[sessionKey].var[varName];
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
      delete get().device[deviceKey];
    },

    removeProcess(pid, sessionKey) {
      const processes = get().session[sessionKey].process;
      delete processes[pid];
    },

    removeSession: (sessionKey) => {
      delete get().device[get().session[sessionKey].ttyShell.key];
      set(({ session }) => ({ session: removeFromLookup(sessionKey, session) }));
    },

    resolve: (fd, meta) => {
      return get().device[meta.fd[fd]];
    },

    setVar: async (sessionKey, varName, varValue) => {
      api.getSession(sessionKey).var[varName] = varValue; // Mutate
    },

    warn: (sessionKey, msg) => {
      api.getSession(sessionKey).ttyIo.write({ key: 'error', msg });
    },
  },

}), {
  name: 'session',
  version: 0,
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
