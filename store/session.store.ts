import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { deepGet, kebabToCamel, KeyedLookup } from 'model/generic.model';
import { Device, makeShellIo, ShellIo, withProcessHandling } from 'model/sh/io/io.model';
import { MessageFromShell, MessageFromXterm } from 'model/sh/tty.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import { TtyShell } from 'model/sh/tty.shell';
import { NamedFunction } from 'model/sh/var.model';
import { FifoDevice } from 'model/sh/io/fifo.device';
import { VarDevice } from 'model/sh/io/var.device';
import { BaseMeta, FileWithMeta } from 'model/sh/parse/parse.model';
import { srcService } from 'model/sh/parse/src.service';
import { NullDevice } from 'model/sh/io/null.device';
import useStageStore from './stage.store';

export type State = {
  session: KeyedLookup<Session>;
  device: KeyedLookup<Device>;
  persist: KeyedLookup<PersistedSession>;
  rehydrated: boolean;
  
  readonly api: {
    addCleanup: (meta: BaseMeta, cleanup: () => void) => void;
    addFunc: (sessionKey: string, funcName: string, wrappedFile: FileWithMeta) => void;
    createSession: (sessionKey: string) => void;
    createProcess: (def: {
      sessionKey: string;
      ppid: number;
      pgid: number;
      src: string;
      posPositionals?: string[];
    }) => ProcessMeta;
    mutateProcess: (
      meta: BaseMeta,
      mutator: Partial<ProcessMeta> | ((process: ProcessMeta) => void),
    ) => void;
    createFifo: (fifoKey: string, size?: number) => FifoDevice;
    createVarDevice: (sessionKey: string, varName: string) => VarDevice;
    ensurePersisted: (sessionKey: string) => PersistedSession;
    getData: (sessionKey: string, pathStr: string) => any;
    getFunc: (sessionKey: string, funcName: string) => NamedFunction | undefined;
    getFuncs: (sessionKey: string) => NamedFunction[];
    getNextPid: (sessionKey: string) => number;
    getProcess: (pid: number, sessionKey: string) => ProcessMeta;
    getProcesses: (sessionKey: string, pgid?: number) => ProcessMeta[];
    getPositional: (pid: number, sessionKey: string, varName: number) => string;
    getVar: (sessionKey: string, varName: string) => any | undefined;
    getVars: (sessionKey: string) => { key: string; value: string }[];
    getSession: (sessionKey: string) => Session;
    persist: (sessionKey: string, data: { history: string[] }) => void;
    removeDevice: (deviceKey: string) => void;
    removeProcess: (pid: number, sessionKey: string) => void;
    removeSession: (sessionKey: string) => void;
    resolve: (deviceKey: string, meta: BaseMeta) => Device;
    setData: (sessionKey: string, path: string, data: any) => void;
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
  /** Executed on kill */
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
    addCleanup: (meta, cleanup) => {
      get().session[meta.sessionKey].process[meta.pid].cleanups.push(cleanup);
    },

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
        positionals: ['rsrm', ...posPositionals || []],
        cleanups: [],
        onSuspend: null,
        onResume: null,
      };
      return processes[pid];
    },

    createSession: (sessionKey) => {
      const persisted = api.ensurePersisted(sessionKey);
      const ttyIo = makeShellIo<MessageFromXterm, MessageFromShell>();
      const ttyShell = new TtyShell(sessionKey, ttyIo, persisted.history);
      const ttyDevice: Device = ttyShell;
      const nullDevice = new NullDevice('/dev/null');

      get().device[nullDevice.key] = nullDevice;
      get().device[ttyDevice.key] = ttyDevice;

      set(({ session }) => ({
        session: addToLookup({
          key: sessionKey,
          func: {},
          ttyIo,
          ttyShell,
          var: {},
          nextPid: 0,
          process: {},
        }, session),
      }));
    },

    createVarDevice(sessionKey, varName) {
      const varDevice = new VarDevice(sessionKey, varName);
      get().device[varDevice.key] = varDevice;
      return varDevice;
    },

    ensurePersisted: (sessionKey) => {
      const newItem: PersistedSession = { key: sessionKey, history: [] };
      const persisted = get().persist?.[sessionKey]??newItem
      set(({ persist: lookup }) => ({ persist: addToLookup(persisted, lookup) }));
      return persisted;
    },

     getData: (sessionKey, pathStr) => {
       const [ first, ...path] = pathStr.split('/').map(kebabToCamel).filter(Boolean);
       if  (first === 'stage') {
        const stage = useStageStore.getState().stage[sessionKey];
        return deepGet(stage, path);
      } else if (first === 'var') {
        const varLookup = get().session[sessionKey].var;
        return deepGet(varLookup, path);
      }
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

    getProcess: (pid, sessionKey) => {
      return get().session[sessionKey].process[pid];
    },

    getProcesses: (sessionKey, pgid) => {
      const processes = Object.values(get().session[sessionKey].process);
      return Number.isFinite(pgid)
        ? processes.filter(x => x.pgid === pgid)
        : processes;
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
      set(({ session }) => ({
        session: removeFromLookup(sessionKey, session),
      }));
    },

    resolve: (deviceKey, meta) => {
      const device = get().device[deviceKey];
      return withProcessHandling(device, meta);
    },

    setData: (sessionKey, pathStr, data) => {
      const [ first, ...path] = pathStr.split('/').map(kebabToCamel).filter(Boolean);
      if (path.length) {
        const last = path.pop()!;
        if  (first === 'stage') {
          const stage = useStageStore.getState().stage[sessionKey];
          deepGet(stage, path)[last] = data;
          useStageStore.api.updateStage(sessionKey, {});
        } else if (first === 'var') {
          const varLookup = get().session[sessionKey].var;
          deepGet(varLookup, path)[last] = data;
        }
      }
    },

    setVar: async (sessionKey, varName, varValue) => {
      api.getSession(sessionKey).var[varName] = varValue; // Mutate
    },

    mutateProcess: (meta, mutator) => {// Mutate
      const process = get().session[meta.sessionKey].process[meta.pid];
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
