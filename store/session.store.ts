import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { BaseMeta, FileWithMeta } from 'model/sh/parse/parse.model';
import type { MessageFromShell, MessageFromXterm } from 'model/sh/tty.model';
import type { NamedFunction } from 'model/sh/var.model';
import { deepClone, KeyedLookup, mapValues } from 'model/generic.model';
import { Device, makeShellIo, ShellIo } from 'model/sh/io/io.model';
import { addToLookup, removeFromLookup, updateLookup } from './store.util';
import { TtyShell } from 'model/sh/tty.shell';
import { FifoDevice } from 'model/sh/io/fifo.device';
import { VarDevice, VarDeviceMode } from 'model/sh/io/var.device';
import { srcService } from 'model/sh/parse/src.service';
import { NullDevice } from 'model/sh/io/null.device';
import { computeNormalizedParts, resolveNormalized, ShError } from 'model/sh/sh.util';

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
    createVarDevice: (sessionKey: string, varPath: string, mode: VarDeviceMode) => VarDevice;
    ensureSession: (sessionKey: string, env: Record<string, any>) => Session;
    ensurePersisted: (sessionKey: string) => PersistedSession;
    getFunc: (sessionKey: string, funcName: string) => NamedFunction | undefined;
    getFuncs: (sessionKey: string) => NamedFunction[];
    getNextPid: (sessionKey: string) => number;
    getProcess: (meta: BaseMeta) => ProcessMeta;
    getProcesses: (sessionKey: string, pgid?: number) => ProcessMeta[];
    getPositional: (pid: number, sessionKey: string, varName: number) => string;
    getVar: <T = any>(sessionKey: string, varName: string) => T;
    getVarDeep: (sessionKey: string, varPath: string) => any | undefined;
    getSession: (sessionKey: string) => Session;
    persist: (sessionKey: string) => void;
    removeDevice: (deviceKey: string) => void;
    removeProcess: (pid: number, sessionKey: string) => void;
    removeSession: (sessionKey: string) => void;
    resolve: (fd: number, meta: BaseMeta) => Device;
    setVar: (sessionKey: string, varName: string, varValue: any) => void;
    setVarDeep: (sessionKey: string, varPath: string, varValue: any) => void;
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
  var: Record<string, any>;
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
        positionals: ['jsh', ...posPositionals || []],
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
          var: {
            PWD: '',
            OLDPWD: '',
            ...persisted.var,
            ...deepClone(env),
          },
        }, session),
      }));
      return get().session[sessionKey];
    },

    createVarDevice(sessionKey, varPath, mode) {
      const device = new VarDevice(sessionKey, varPath, mode);
      return get().device[device.key] = device;
    },

    ensureSession: (sessionKey, env) => {
      const { session } = get();
      return session[sessionKey] = session[sessionKey]
        || get().api.createSession(sessionKey, env);
    },

    ensurePersisted: (sessionKey) => {
      const persisted = get().persist?.[sessionKey]??{ key: sessionKey, history: [], var: {} };
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

    getVarDeep: (sessionKey, varPath) => {
      const root = get().session[sessionKey].var;
      return Function('__', `return __.${varPath}`)(root);
    },

    getSession: (sessionKey) =>
      get().session[sessionKey],

    persist: (sessionKey) => {
      const { ttyShell, var: varLookup } = api.getSession(sessionKey);
      
      // TODO manual persist/rehydrate

      // localStorage.setItem(`history@session-${sessionKey}`, JSON.stringify({
      //   history: ttyShell.getHistory(),
      // }));
      // localStorage.setItem(`var@session-${sessionKey}`, JSON.stringify({
      //   var: mapValues(varLookup, x => {
      //     try {// Unserializable vars are ignored
      //       return JSON.parse(JSON.stringify(x));
      //     } catch {};
      //   }),
      // }));

      set(({ persist }) => ({
        persist: updateLookup(sessionKey, persist, () => ({
          history: ttyShell.getHistory(),
          var: mapValues(varLookup, x => {
            try {// Unserializable is ignored
              return JSON.parse(JSON.stringify(x));
            } catch {}
          }),
        })),
      }));
    },

    removeDevice(deviceKey) {
      delete get().device[deviceKey];
    },

    removeProcess(pid, sessionKey) {
      const processes = get().session[sessionKey].process;
      delete processes[pid];
    },

    removeSession: (sessionKey) => {
      const { process, ttyShell } = get().session[sessionKey];
      for (const { cleanups } of Object.values(process)) {
        cleanups.forEach(cleanup => cleanup());
        cleanups.length = 0;
      }
      delete get().device[ttyShell.key];
      set(({ session }) => ({ session: removeFromLookup(sessionKey, session) }));
    },

    resolve: (fd, meta) => {
      return get().device[meta.fd[fd]];
    },

    setVar: (sessionKey, varName, varValue) => {
      api.getSession(sessionKey).var[varName] = varValue;
    },

    setVarDeep: (sessionKey, varPath, varValue) => {
      /** Like root of process context, but only has `home` */
      const root = { home : api.getSession(sessionKey).var };
      const pwd = api.getVar(sessionKey, 'PWD') as string;
      const parts = computeNormalizedParts(varPath, root, pwd);

      if (parts[0] === 'home' && parts.length > 1) {
        const childKey = parts.pop() as string;
        try {
          const parent = resolveNormalized(parts, root);
          parent[childKey] = varValue;
        } catch (e) {
          throw new ShError(`cannot resolve /${parts.join('/')}`, 1);
        }
      } else {
        throw new ShError('only the home directory is writable', 1);
      }
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

if (module.hot) {
  // Avoid breaking preact-prefresh
  module.hot.accept();
}
