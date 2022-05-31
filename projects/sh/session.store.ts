import create from 'zustand';
import { devtools } from 'zustand/middleware';

import type { BaseMeta, FileWithMeta } from './parse/parse.model';
import type { MessageFromShell, MessageFromXterm } from './tty.model';
import type { NamedFunction } from './var.model';
import { Device, makeShellIo, ShellIo } from './io/io.model';
import { addToLookup, deepClone, mapValues, removeFromLookup, tryLocalStorageGet, tryLocalStorageSet } from '../service/generic';
import { TtyShell } from './tty.shell';
import { FifoDevice } from './io/fifo.device';
import { VarDevice, VarDeviceMode } from './io/var.device';
import { srcService } from './parse/src.service';
import { NullDevice } from './io/null.device';
import { computeNormalizedParts, resolveNormalized, ShError } from './sh.util';

export type State = {
  session: TypeUtil.KeyedLookup<Session>;
  device: TypeUtil.KeyedLookup<Device>;
  
  readonly api: {
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
    rehydrate: (sessionKey: string) => Rehydrated;
    removeDevice: (deviceKey: string) => void;
    removeProcess: (pid: number, sessionKey: string) => void;
    removeSession: (sessionKey: string) => void;
    resolve: (fd: number, meta: BaseMeta) => Device;
    setVar: (sessionKey: string, varName: string, varValue: any) => void;
    setVarDeep: (sessionKey: string, varPath: string, varValue: any) => void;
    warn: (sessionKey: string, msg: string) => void;
    warnCleanly: (sessionKey: string, msg: string) => void;
  }
}

export interface Session {
  key: string;
  func: TypeUtil.KeyedLookup<NamedFunction>;
  /**
   * Currently only support one tty per session,
   * i.e. cannot have two terminals in same session.
   * This could be changed e.g. `ttys: { io, shell }[]`.
   */
  ttyIo: ShellIo<MessageFromXterm, MessageFromShell>;
  ttyShell: TtyShell,
  var: Record<string, any>;
  nextPid: number;
  process: TypeUtil.KeyedLookup<ProcessMeta>;
}

interface Rehydrated {
  history: string[] | null;
  var: Record<string, any> | null;
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
  /**
   * Executed on Ctrl-C or `kill`.
   * May contain `() => reject(killError(meta))` ...
   */
  cleanups: ((() => void) & {  })[];
  /**
   * Executed on suspend, without clearing `true` returners.
   * The latter should be idempotent, e.g. unsubscribe, pause.
   */
  onSuspends: (() => void | boolean)[];
  /**
   * Executed on resume, without clearing `true` returners.
   * The latter should be idempotent, e.g. reject, resolve.
   */
  onResumes: (() => void | boolean)[];
  positionals: string[];
}

const useStore = create<State>(devtools((set, get) => ({
  device: {},
  session: {},
  persist: {},

  api: {
    addFunc(sessionKey, funcName, file) {
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

    createProcess({ sessionKey, ppid, pgid, src, posPositionals }) {
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
        onSuspends: [],
        onResumes: [],
      };
      return processes[pid];
    },

    createSession(sessionKey, env) {
      const persisted = api.rehydrate(sessionKey);
      const ttyIo = makeShellIo<MessageFromXterm, MessageFromShell>();
      const ttyShell = new TtyShell(sessionKey, ttyIo, persisted.history || []);
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

    ensureSession(sessionKey, env) {
      const { session } = get();
      return session[sessionKey] = session[sessionKey]
        || get().api.createSession(sessionKey, env);
    },

    getFunc(sessionKey, funcName) {
      return get().session[sessionKey].func[funcName] || undefined;
    },

    getFuncs(sessionKey) {
      return Object.values(get().session[sessionKey].func);
    },

    getNextPid(sessionKey) {
      return get().session[sessionKey].nextPid++;
    },

    getPositional(pid, sessionKey, varName) {
      return get().session[sessionKey].process[pid].positionals[varName] || '';
    },

    getProcess({ pid, sessionKey }) {
      return get().session[sessionKey].process[pid];
    },

    getProcesses(sessionKey, pgid) {
      const processes = Object.values(get().session[sessionKey].process);
      return pgid === undefined ? processes : processes.filter(x => x.pgid === pgid);
    },

    getVar(sessionKey, varName) {
      return get().session[sessionKey].var[varName];
    },

    getVarDeep(sessionKey, varPath) {
      const root = get().session[sessionKey].var;
      return Function('__', `return __.${varPath}`)(root);
    },

    getSession(sessionKey) {
      return get().session[sessionKey];
    },

    persist(sessionKey) {
      const { ttyShell, var: varLookup } = api.getSession(sessionKey);

      tryLocalStorageSet(
        `history@session-${sessionKey}`,
        JSON.stringify(ttyShell.getHistory()),
      );

      tryLocalStorageSet(`var@session-${sessionKey}`, JSON.stringify(
        mapValues(varLookup, x => {
          try {// Unserializable vars are ignored
            return JSON.parse(JSON.stringify(x));
          } catch {};
        }),
      ));
    },

    rehydrate(sessionKey) {
      try {
        const storedHistory = JSON.parse(tryLocalStorageGet(`history@session-${sessionKey}`) || 'null');
        const storedVar = JSON.parse(tryLocalStorageGet(`var@session-${sessionKey}`) || 'null');
        return { history: storedHistory, var: storedVar };
      } catch (e) {// Can fail in CodeSandbox in Chrome Incognito
        console.error(e);
        return { history: null, var: null };
      }
    },
    removeDevice(deviceKey) {
      delete get().device[deviceKey];
    },

    removeProcess(pid, sessionKey) {
      const processes = get().session[sessionKey].process;
      delete processes[pid];
    },

    removeSession(sessionKey) {
      const session = get().session[sessionKey];
      if (session) {
        const { process, ttyShell } = get().session[sessionKey];
        for (const { cleanups } of Object.values(process)) {
          cleanups.forEach(cleanup => cleanup());
          cleanups.length = 0;
        }
        delete get().device[ttyShell.key];
        set(({ session }) => ({ session: removeFromLookup(sessionKey, session) }));
      } else {
        console.log(`removeSession: ${sessionKey}: cannot remove non-existent session`);
      }
    },

    resolve(fd, meta) {
      return get().device[meta.fd[fd]];
    },

    setVar(sessionKey, varName, varValue) {
      api.getSession(sessionKey).var[varName] = varValue;
    },

    setVarDeep(sessionKey, varPath, varValue) {
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

    warn(sessionKey, msg) {
      api.getSession(sessionKey).ttyIo.write({ key: 'warn', msg });
    },

    warnCleanly(sessionKey, msg) {
      const { xterm } = api.getSession(sessionKey).ttyShell;
      if (xterm.hasInput()) {
        msg = '\n\r' + msg;
      }
      api.getSession(sessionKey).ttyIo.write({ key: 'warn', msg });
      setTimeout(() => xterm.showPendingInput()); // Hack: prompts after .write
    },
  },

}), 'session'));

const api = useStore.getState().api;
const useSessionStore = Object.assign(useStore, { api });

export default useSessionStore;

if (module.hot) {// Avoid breaking preact-prefresh
  module.hot.accept();
}
