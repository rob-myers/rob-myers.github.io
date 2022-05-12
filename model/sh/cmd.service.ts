import cliColumns from 'cli-columns';

import { testNever, truncateOneLine, Deferred, pause, keysDeep, safeStringify, pretty, deepGet } from 'model/generic.model';
import type * as Sh from './parse/parse.model';
import type { NamedFunction } from './var.model';
import { getProcessStatusIcon, ReadResult, preProcessRead } from './io/io.model';
import useSession, { ProcessStatus } from 'store/session.store';
import { computeNormalizedParts, createKillError as killError, normalizeAbsParts, ProcessError, resolveNormalized, resolvePath, ShError } from './sh.util';
import { cloneParsed, getOpts } from './parse/parse.util';
import { parseService } from './parse/parse.service';
import { ansiBlue, ansiYellow, ansiReset, ansiWhite } from './tty.xterm';
import { TtyShell } from './tty.shell';

import { scriptLookup } from './sh.lib';
// Connections to "outside" i.e. react-query, rxjs
import { queryCache } from 'projects/service/query-client';
import { ensureWire } from 'projects/service/wire';

const commandKeys = {
  /** Change current key prefix */
  cd: true,
  /** List function definitions */
  declare: true,
  /** Output arguments as space-separated string */
  echo: true,
  /** Exit with code 1 */
  false: true,
  /** Get each arg from __TODO__ */
  get: true,
  /** List commands */
  help: true,
  /** List previous commands */
  history: true,
  /** Kill a process */
  kill: true,
  /** List variables */
  ls: true,
  /** List running processes */
  ps: true,
  /** Print current key prefix */
  pwd: true,
  /** Exit from a function */
  return: true,
  /** Remove variable(s) */
  rm: true,
  /** Run a javascript generator */
  run: true,
  /** Echo session key */
  session: true,
  /** Set something */
  set: true,
  /** Wait for specified number of seconds */
  sleep: true,
  /** Run shell code stored as a string somewhere */
  source: true,
  /** Exit with code 0 */
  true: true,
  /** Unset top-level variables and shell functions */
  unset: true,
};
type CommandName = keyof typeof commandKeys;

class CmdService {

  isCmd(word: string): word is CommandName {
    return word in commandKeys;
  }
  
  async *runCmd(node: Sh.CallExpr | Sh.DeclClause, command: CommandName, args: string[]) {
    const { meta } = node;
    switch (command) {
      case 'cd': {
        if (args.length > 1) {
          throw new ShError('usage: `cd /`, `cd`, `cd foo/bar`, `cd /foo/bar`, `cd ..` and `cd -`', 1);
        }
        const prevPwd: string = useSession.api.getVar(meta.sessionKey, 'OLDPWD');
        const currPwd: string = useSession.api.getVar(meta.sessionKey, 'PWD');
        useSession.api.setVar(meta.sessionKey, 'OLDPWD', currPwd);

        try {
          if (!args[0]) {
            useSession.api.setVar(meta.sessionKey, 'PWD', 'home');
          } else if (args[0] === '-') {
            useSession.api.setVar(meta.sessionKey, 'PWD', prevPwd);
          } else if (args[0].startsWith('/')) {
            const parts = normalizeAbsParts(args[0].split('/'));
            if (resolveNormalized(parts, this.provideProcessCtxt(node.meta)) === undefined) {
              throw Error;
            }
            useSession.api.setVar(meta.sessionKey, 'PWD', parts.join('/'));
          } else {
            const parts = normalizeAbsParts(currPwd.split('/').concat(args[0].split('/')));
            if (resolveNormalized(parts, this.provideProcessCtxt(node.meta)) === undefined) {
              throw Error;
            }
            useSession.api.setVar(meta.sessionKey, 'PWD', parts.join(('/')));
          }
        } catch {
          useSession.api.setVar(meta.sessionKey, 'OLDPWD', prevPwd);
          throw new ShError(`${args[0]} not found`, 1);
        }
        break;
      }
      case 'declare': {
        const funcs = useSession.api.getFuncs(meta.sessionKey);
        for (const { key, src } of funcs) {
          const lines = `${ansiBlue}${key}${ansiWhite} () ${src}`.split(/\r?\n/);
          for (const line of lines) yield line;
          yield '';
        } 
        break;
      }
      case 'echo': {
        const { opts, operands } = getOpts(args, { boolean: [
          'a', // output array
          'n', // cast as numbers
        ], });
        if (opts.a) {
          yield opts.n ? operands.map(Number) : operands;
        } else if (opts.n) {
          for (const operand of operands) yield Number(operand);
        } else {
          yield operands.join(' ');
        }
        break;
      }
      case 'false': {
        node.exitCode = 1;
        break;
      }
      case 'get': {
        yield* this.get(node, args);
        break;
      }
      case 'help': {
        const { ttyShell } = useSession.api.getSession(meta.sessionKey);
        yield `The following commands are supported:`;
        const commands = cliColumns(Object.keys(commandKeys), { width: ttyShell.xterm.xterm.cols }).split(/\r?\n/);
        for (const line of commands) yield `${ansiBlue}${line}`;
        // yield `Traverse context via \`ls\` or \`ls -l var.foo.bar\` (Object.keys).` 
        yield `View shell functions via ${ansiBlue}declare${ansiWhite}.`
        // yield `Use Ctrl-c to interrupt and Ctrl-l to clear screen.`
        // yield `View history via up/down or \`history\`.`
        // yield `Traverse input using Option-left/right and Ctrl-{a,e}.`
        // yield `Delete input using Ctrl-{w,u,k}.`
        // yield `You can copy and paste.`
        // yield `Features: functions, pipes, command substitution, background processes, history, readline-esque shortcuts, copy-paste.`
        break;
      }
      case 'history': {
        const { ttyShell } = useSession.api.getSession(meta.sessionKey);
        const history = ttyShell.getHistory();
        for (const line of history) yield line;
        break;
      }
      case 'kill': {
        const { opts, operands } = getOpts(args, { boolean: [
          'STOP', /** --STOP pauses a process */
          'CONT', /** --CONT continues a paused process */
        ] });
        const pgids = operands.map(x => parseJsonArg(x))
          .filter((x): x is number => Number.isFinite(x));
        for (const pgid of pgids) {
          const processes = useSession.api.getProcesses(meta.sessionKey, pgid).reverse();
          processes.forEach(p => {
            if (opts.STOP) {
              p.onSuspend?.();
              p.onSuspend = null;
              p.status = ProcessStatus.Suspended;
            } else if (opts.CONT) {
              p.onResume?.();
              p.onResume = null;
              p.status = ProcessStatus.Running;
            } else {
              p.status = ProcessStatus.Killed;
              p.onResume?.();
              p.onSuspend = p.onResume = null;
              // Immediate clean e.g. stops `sleep`
              setTimeout(() => { 
                p.cleanups.forEach(cleanup => cleanup());
                p.cleanups.length = 0;
              });
            }
          });
        }
        break;
      }
      case 'ls': {
        const { opts, operands } = getOpts(args, { boolean: [
          '1', /** One line per item */
          'l', /** Detailed */
          'r', /** Recursive properties (prototype) */
          'a', /** Show capitalized vars at top level */
        ] });
        const pwd = useSession.api.getVar(meta.sessionKey, 'PWD');
        const queries = operands.length ? operands.slice() : [''];
        const root = this.provideProcessCtxt(meta);
        const roots = queries.map(path => resolvePath(path, root, pwd));

        const { ttyShell } = useSession.api.getSession(node.meta.sessionKey);
        for (const [i, obj] of roots.entries()) {
          if (obj === undefined) {
            useSession.api.warn(meta.sessionKey, `ls: "${queries[i]}" is not defined`);
            continue;
          }

          if (roots.length > 1) yield `${ansiBlue}${queries[i]}:`;
          let keys = (opts.r ? keysDeep(obj) : Object.keys(obj)).sort();
          let items = [] as string[];
          if (pwd === 'home' && !opts.a) keys = keys.filter(x => x.toUpperCase() !== x || /^[0-9]/.test(x));

          if (opts.l) {
            if (typeof obj === 'function') keys = keys.filter(x => !['caller', 'callee', 'arguments'].includes(x));
            const metas = opts.r
              ? keys.map(x => deepGet(obj, x.split('/'))?.constructor?.name || (obj[x] === null ? 'null' : 'undefined'))
              : keys.map(x => obj[x]?.constructor?.name || (obj[x] === null ? 'null' : 'undefined'));
            const metasWidth = Math.max(...metas.map(x => x.length));
            items = keys.map((x, i) => `${ansiYellow}${metas[i].padEnd(metasWidth)}${ansiWhite} ${x}`);
          } else if (opts[1]) {
            items = keys;
          } else {
            items = cliColumns(keys, { width: ttyShell.xterm.xterm.cols }).split(/\r?\n/);
          }
          for (const item of items) yield item;
        }
        break;
      }
      case 'ps': {
        const { opts } = getOpts(args, { boolean: [
          'a', /** Show all processes */
          's', /** Show process src */
        ], });
        const processes = Object.values(useSession.api.getProcesses(meta.sessionKey))
          .filter(({ key: pid, pgid }) => opts.a ? true : pid === pgid);
        const title = ['pid', 'ppid', 'pgid'].map(x => x.padEnd(5)).join(' ')

        if (opts.s) {
          for (const { key: pid, ppid, pgid, status, src } of processes) {
            const icon = getProcessStatusIcon(status);
            const info = [pid, ppid, pgid].map(String).map(x => x.padEnd(5)).join(' ')
            yield `${ansiBlue}${title}${ansiReset}`;
            yield `${info}${icon}`;
            yield src + '\n';
          }
        } else {
          yield `${ansiBlue}${title}${ansiReset}`;
          for (const { key: pid, ppid, pgid, status, src } of processes) {
            const icon = getProcessStatusIcon(status);
            const info = [pid, ppid, pgid].map(String).map(x => x.padEnd(5)).join(' ');
            const shortSrc = truncateOneLine(src.trimLeft(), 30);
            yield `${info}${icon}  ${shortSrc}`;
          }
        }
        break;
      }
      case 'pwd': {
        yield '/' + (useSession.api.getVar(meta.sessionKey, 'PWD'));
        break;
      }
      case 'return': {
        const process = useSession.api.getProcess(meta);
        process.status = ProcessStatus.Killed;
        process.onResume?.();
        process.onSuspend = process.onResume = null;
        break;
      }
      case 'rm': {
        const root = this.provideProcessCtxt(meta);
        const pwd = useSession.api.getVar<string>(meta.sessionKey, 'PWD');
        for (const path of args) {
          const parts = computeNormalizedParts(path, root, pwd);
          if (parts[0] === 'home' && parts.length > 1) {
            const last = parts.pop() as string;
            delete resolveNormalized(parts, root)[last];
          } else {
            throw new ShError(`cannot delete ${path}`, 1);
          }
        }
        break;
      }
      /** e.g. run '({ api:{read} }) { yield "foo"; yield await read(); }' */
      case 'run': {
        try {
          const func = Function('_', `return async function *generator ${args[0]}`);
          yield* func()(this.provideProcessCtxt(meta, args.slice(1)));
        } catch (e) {
          if (e instanceof ProcessError || e instanceof ShError) {
            throw e;
          } else {
            console.error(e); // Provide JS stack
            throw new ShError(`${e}`, 1);
          }
        }
        break;
      }
      case 'session': {
        yield meta.sessionKey;
        break;
      }
      case 'set': {
        const root = this.provideProcessCtxt(meta);
        const value = parseJsArg(args[1]);
        if (args[0][0] === '/') {
          Function('__1', '__2', `return __1.${args[0].slice(1)} = __2`)(root, value);
        } else {
          const cwd = this.computeCwd(meta, root);
          Function('__1', '__2', `return __1.${args[0]} = __2`)(cwd, value);
        }
        break;
      }
      case 'sleep': {
        const process = useSession.api.getProcess(meta);
        let ms = 1000 * (args.length ? parseFloat(parseJsonArg(args[0])) || 0 : 1);
        let started = -1;
        do {
          await new Promise<void>((resolve, reject) => {
            process.onSuspend = () => { ms = started + ms - Date.now(); resolve(); };
            // NOTE potentially adding many cleanups
            useSession.api.addCleanup(meta, () => reject(killError(meta)));
            (started = Date.now()) && setTimeout(resolve, ms);
          });
          yield; // Pauses execution if process suspended
        } while (Date.now() < started + ms - 1)
        break;
      }
      case 'source': {
        const script = this.get(node, [args[0]])[0];
        if (script === undefined) {
          useSession.api.warn(meta.sessionKey, `source: "${args[0]}" not found`);
        } else if (typeof script !== 'string') {
          useSession.api.warn(meta.sessionKey, `source: "${args[0]}" is not a string`);
        } else {
          // We cache scripts
          const parsed = parseService.parse(script, true);
          // We clone meta; pid will be overwritten in `ttyShell.spawn`
          parsed.meta = { ...meta, fd: { ...meta.fd }, stack: meta.stack.slice() };
          const { ttyShell } = useSession.api.getSession(meta.sessionKey);
          await ttyShell.spawn(parsed, { posPositionals: args.slice(1) });
        }
        break;
      }
      case 'true': {
        node.exitCode = 0;
        break;
      }
      case 'unset': {
        const { var: v, func } = useSession.api.getSession(meta.sessionKey);
        for (const arg of args) {
          delete v[arg];
          delete func[arg];
        }
        break;
      }
      default: throw testNever(command);
    }
  }

  get(node: Sh.BaseNode, args: string[]) {
    const root = this.provideProcessCtxt(node.meta);
    const pwd = useSession.api.getVar<string>(node.meta.sessionKey, 'PWD');
    const outputs = args.map(arg => resolvePath(arg, root, pwd));
    node.exitCode = outputs.length && outputs.every(x => x === undefined) ? 1 : 0;
    return outputs;
  }

  private computeCwd(meta: Sh.BaseMeta, root: any) {
    const pwd = useSession.api.getVar(meta.sessionKey, 'PWD');
    return resolveNormalized(pwd.split('/'), root);
  }

  async launchFunc(node: Sh.CallExpr, namedFunc: NamedFunction, args: string[]) {
    const cloned = cloneParsed(namedFunc.node);
    const { ttyShell } = useSession.api.getSession(node.meta.sessionKey);
    Object.assign(cloned.meta, {
      ...node.meta,
      ppid: node.meta.pid,
      stack: node.meta.stack.concat(namedFunc.key), // TODO elsewhere?
    } as Sh.BaseMeta);
    await ttyShell.spawn(cloned, { posPositionals: args.slice() });
  }

  /**
   * NOTE `this` must only refer to `meta` and `parent`.
   */
  private readonly processApi = {
    /**
     * This will be overwritten via Function.prototype.bind.
     */
    meta: {} as Sh.BaseMeta,
    /**
     * This will be rewritten via Function.prototype.bind.
     */
    parent: this,

    getWire() {
      return getWire(this.meta);
    },
  
    getKillError() {
      return killError(this.meta);
    },
  
    getProcess() {
      return useSession.api.getProcess(this.meta);
    },
  
    isTtyAt(fd = 0) {
      return this.meta.fd[fd]?.startsWith('/dev/tty-');
    },
  
    /** js parse with string fallback */
    parseJsArg,
  
    /** Output 1, 2, ... at fixed intervals */
    async *poll(args: string[]) {
      const seconds = args.length ? parseFloat(parseJsonArg(args[0])) || 1 : 1;
      const [delayMs, deferred] = [Math.max(seconds, 0.5) * 1000, new Deferred<void>()];
      useSession.api.addCleanup(this.meta, () => deferred.resolve());
      let count = 1;
      while (true) {
        yield count++;
        await Promise.race([pause(delayMs), deferred.promise]);
      }
    },
  
    pretty: prettySafe,

    /**
     * Read once from stdin. We convert `{ eof: true }` to `null` for
     * easier assignment, but beware of other falsies.
     */
    async read(chunks = false) {
      const result = await this.parent.readOnce(this.meta, chunks);
      return result?.eof ? null : result.data;
    },

    /**
     * Syntactic sugar to handle ping-pong on wire:
     * `req := { key: 'foo', ... }` --> `{ key: 'bar', req, res }`
     */
    async reqRes(reqMsg: NPC.NpcEvent) {
      return new Promise(resolve => {
        const wire = getWire(this.meta); // We cannot this.getWire()
        const sub = wire.subscribe((e) => {
          if ('req' in e && e.req === reqMsg) {
            sub.unsubscribe();
            resolve(e.res);
          }
        });
        wire.next(reqMsg)
      });
    },
  
    /** TODO support pause/resume like command `sleep` */
    sleep(seconds: number) {
      return new Promise<void>((resolve, reject) => {
        setTimeout(resolve, seconds * 1000);
        useSession.api.addCleanup(this.meta, () => reject(killError(this.meta)));
      })
    },
  
    /** JSON.parse which returns `undefined` on parse error */
    safeJsonParse,
  
    throwError,
  };

  private provideProcessCtxt(meta: Sh.BaseMeta, posPositionals: string[] = []) {
    const session = useSession.api.getSession(meta.sessionKey);
    return new Proxy({
      home: session.var,
      cache: queryCache,
      etc: scriptLookup,
    }, {
      get: (_, key) => {
        if (key === 'api') return new Proxy({}, {
          get: ({}, key: keyof typeof this.processApi) => {
            if (key === 'meta' || key === 'parent') return null
            return this.processApi[key]?.bind({ meta, parent: this }) || null;
          },
          // TODO ownKeys (requires getOwnPropertyDescriptor)
        });
        if (key === 'args') return posPositionals;
        return (_ as any)[key];
      },
      set: (_, key, value) => {
        if (key === 'args') {// Assume `posPositionals` is fresh i.e. just sliced
          posPositionals.length = 0;
          posPositionals.push(...value);
          return true;
        }
        return false;
      },
      deleteProperty(_target, _key) {
        return false;
      },
      // getOwnPropertyDescriptor(target, prop) {
      //   return { enumerable: true, configurable: true };
      // },
      ownKeys(target) {
        // return Reflect.ownKeys(target).concat('api', 'args', 'site');
        return Reflect.ownKeys(target);
      },
    });
  }

  private async *readLoop(
    meta: Sh.BaseMeta,
    /** Read exactly one item of data? */
    once = false,
    chunks: boolean,
  ) {
    const process = useSession.api.getProcess(meta);
    const device = useSession.api.resolve(0, meta);

    if (device === undefined) {
      return;
    } else if (device instanceof TtyShell && process.pgid !== 0) {
      throw new ShError('background process tried to read tty', 1);
    }

    let result = {} as ReadResult;
    while (!(result = await device.readData(once, chunks)).eof) {
      if (result.data !== undefined) {
        yield result;
        if (once) break;
      }
      await preProcessRead(process, device);
    }
  }

  /**
   * Reading once often means two outputs i.e. `{ data }` then `{ eof: true }`.
   * If there is any real data we return `{ data }`,
   * otherwise we (possibly eventually) return `{ eof: true }`.
   */
  private async readOnce(meta: Sh.BaseMeta, chunks: boolean): Promise<ReadResult> {
    for await (const data of this.readLoop(meta, true, chunks)) {
      return data;
    }
    return { eof: true };
  }
  
}

/** js parse with string fallback */
function parseJsArg(input: string) {
  try {
    return Function(`return ${input}`)();
  } catch (e) {
    return input;
  }
}
/** JSON.parse with string fallback */
function parseJsonArg(input: string) {
  try {
    return input === undefined ? undefined : JSON.parse(input);
  } catch {
    return input;
  }
}
function prettySafe(x: any) {
  pretty(JSON.parse(safeStringify(x)));
}
function safeJsonParse(input: string) {
  try {
    return JSON.parse(input);
  } catch  {
    return;
  }
}
function throwError(message: string, exitCode?: number) {
  throw new ShError(message, exitCode || 1);
}

function getWire(meta: Sh.BaseMeta) {
  const { var: home } = useSession.api.getSession(meta.sessionKey);
  const wireKey = home.WIRE_KEY;
  if (!(typeof wireKey === 'string' && wireKey)) {
    throwError(`home/WIRE_KEY must be a non-empty string`);
  }
  return ensureWire(wireKey);
}

export const cmdService = new CmdService;
