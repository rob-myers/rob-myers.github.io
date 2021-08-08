import cliColumns from 'cli-columns';

import { testNever, truncate, Deferred, pause, keysDeep, safeStringify, pretty } from 'model/generic.model';
import type * as Sh from './parse/parse.model';
import type { NamedFunction } from './var.model';
import { getProcessStatusIcon, ReadResult, dataChunk, isDataChunk, preProcessRead } from './io/io.model';
import useSession, { ProcessStatus } from 'store/session.store';
import { computeNormalizedParts, createKillError as killError, normalizeAbsParts, resolveNormalized, resolvePath, ShError } from './sh.util';
import { cloneParsed, getOpts } from './parse/parse.util';
import { ansiBlue, ansiYellow, ansiReset, ansiWhite } from './tty.xterm';
import { TtyShell } from './tty.shell';

const commandKeys = {
  /** Execute a javascript function */
  call: true,
  /** Change current key prefix */
  cd: true,
  /** List function definitions */
  declare: true,
  /** Output arguments as space-separated string */
  echo: true,
  /** Evaluate and return a javascript expression */
  expr: true,
  /** Exit with code 1 */
  false: true,
  /** Filter inputs */
  filter: true,
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
  /** Output 1, 2, ... at fixed intervals */
  poll: true,
  /** List running processes */
  ps: true,
  /** Print current key prefix */
  pwd: true,
  /** Apply function to each item from stdin */
  map: true,
  /** Reduce all items from stdin */
  reduce: true,
  /** Exit from a function */
  return: true,
  /** Remove variable(s) */
  rm: true,
  /** Run a javascript generator */
  run: true,
  /** Echo session key */
  session: true,
  /** Set something in stageAndVars */
  set: true,
  /** Wait for specified number of seconds */
  sleep: true,
  /**
   * Split arrays from stdin into items.
   * Alternatively, split strings by provided separator.
   */
  split: true,
  /** Collect stdin into a single array */
  sponge: true,
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
      case 'call': {
        const func = Function(`return ${args[0]}`);
        yield await func()(this.provideProcessCtxt(meta, args.slice(1)));
        break;
      }
      case 'cd': {
        if (args.length > 1) {
          throw new ShError('usage: `cd /`, `cd`, `cd foo/bar`, `cd /foo/bar`, `cd ..` and `cd -`', 1);
        }
        const prevPwd: string = useSession.api.getVar(meta.sessionKey, 'OLDPWD') || '';
        const currPwd: string = useSession.api.getVar(meta.sessionKey, 'PWD') || '';
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
      case 'expr': {
        yield this.parseJsArg(args.join(' '));
        break;
      }
      case 'false': {
        node.exitCode = 1;
        break;
      }
      case 'filter': {
        const func = Function(`fn = ${args[0]}; return (...args) => fn(...args) ? args[0] : undefined`);
        yield* this.read(meta, (data) => func()(data, this.provideProcessCtxt(meta)));
        break;
      }
      case 'get': {
        yield* this.get(node, args);
        break;
      }
      case 'help': {
        const { ttyShell } = useSession.api.getSession(meta.sessionKey);
        yield `1) The following commands are supported:`;
        const commands = cliColumns(Object.keys(commandKeys), { width: ttyShell.xterm.xterm.cols }).split(/\r?\n/);
        for (const line of commands) yield `${ansiBlue}${line}`;
        yield `2) Traverse context via \`ls\` or \`ls -l var.foo.bar\` (Object.keys).` 
        yield `3) View shell functions via \`declare\`.`
        yield `4) Use Ctrl-c to interrupt and Ctrl-l to clear screen.`
        yield `5) View history via up/down or \`history\`.`
        yield `6) Traverse input using Option-left/right and Ctrl-{a,e}.`
        yield `7) Delete input using Ctrl-{w,u,k}.`
        yield `8) You can copy and paste.`
        yield `9) Pipes, command substitution and background processes are supported.`
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
        const pgids = operands.map(x => this.parseJsonArg(x))
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
          'a', /** Show capitilized vars at top level */
        ], });
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
          if (pwd === 'home' && !opts.a) keys = keys.filter(x => x.toUpperCase() !== x);

          if (opts.l) {
            if (typeof obj === 'function') keys = keys.filter(x => !['caller', 'callee', 'arguments'].includes(x));
            const metas = keys.map(x => obj[x]?.constructor?.name || (obj[x] === null ? 'null' : 'undefined'));
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
      case 'map': {
        const func = Function(`return ${args[0]}`);
        yield* this.read(meta, (data) => func()(data, this.provideProcessCtxt(meta)));
        break;
      }
      case 'poll': {
        const seconds = args.length ? parseFloat(this.parseJsonArg(args[0])) || 0 : 1;
        const [delayMs, deferred] = [Math.max(seconds, 0.5) * 1000, new Deferred<void>()];
        useSession.api.addCleanup(meta, () => deferred.resolve());
        let count = 1;
        while (true) {
          yield count++;
          await Promise.race([pause(delayMs), deferred.promise]);
        }
      }
      case 'ps': {
        const { opts } = getOpts(args, { boolean: [
          'a', /** Show all processes */
          's', /** Show process src */
        ], });
        const processes = Object.values(useSession.api.getProcesses(meta.sessionKey))
          .filter(opts.a ? x => x : ({ key: pid, pgid }) => pid === pgid);
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
            const info = [pid, ppid, pgid].map(String).map(x => x.padEnd(5)).join(' ')
            yield `${info}${icon}  ${truncate(src, 30)}`;
          }
        }
        break;
      }
      case 'pwd': {
        yield '/' + (useSession.api.getVar(meta.sessionKey, 'PWD') || '');
        break;
      }
      case 'reduce': {
        const inputs = [] as any[];
        const reducer = Function(`return ${args[0]}`)();
        yield* this.read(meta, (data: any[]) => { inputs.push(data); });
        yield args[1]
          ? inputs.reduce(reducer, this.parseJsArg(args[1]))
          : inputs.reduce(reducer);
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
        const pwd = useSession.api.getVar<string>(meta.sessionKey, 'PWD') || '';
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
        const func = Function('_', `return async function *generator ${args[0]}`);
        yield* func()(this.provideProcessCtxt(meta, args.slice(1)));
        break;
      }
      case 'session': {
        yield meta.sessionKey;
        break;
      }
      case 'set': {
        const root = this.provideProcessCtxt(meta);
        const value = this.parseJsArg(args[1]);
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
        let ms = 1000 * (args.length ? parseFloat(this.parseJsonArg(args[0])) || 0 : 1);
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
      case 'split': {
        const arg = this.parseJsonArg(args[0]);
        yield* arg === undefined ? this.split(meta) : this.splitBy(meta, arg);
        break;
      }
      case 'sponge': {
        const outputs = [] as any[];
        yield* this.read(meta, (data: any[]) => { outputs.push(data); });
        yield outputs;
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
    const pwd = useSession.api.getVar<string>(node.meta.sessionKey, 'PWD') || '';
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

  private provideProcessApi(meta: Sh.BaseMeta) {
    return {
      // We convert { eof: true } to null, for truthy test
      read: async () => {
        const result = await this.readOnce(meta);
        return result?.eof ? null : result;
      },
      // TODO support pause/resume like command `sleep`
      sleep: (seconds: number) => new Promise<void>((resolve, reject) => {
        setTimeout(resolve, seconds * 1000);
        useSession.api.addCleanup(meta, () => reject(killError(meta)));
      }),
    };
  }

  private provideProcessCtxt(meta: Sh.BaseMeta, posPositionals: string[] = []) {
    const session = useSession.api.getSession(meta.sessionKey);
    return new Proxy({
      home: session.var,
      util: this.shellUtil,
    }, {
      get: (_, key) => {
        if (key === 'api') return this.provideProcessApi(meta);
        if (key === 'args') return posPositionals;
        return (_ as any)[key];
      },
      deleteProperty: (_target, _key) => {
        return false;
      },
    });
  }

  private shellUtil = {
    pretty: (x: any) => pretty(JSON.parse(safeStringify(x))),
  };

  private async *readLoop(
    meta: Sh.BaseMeta,
    body: (res: ReadResult) => any,
    /** Read exactly one item of data? */
    once = false,
  ) {
    const process = useSession.api.getProcess(meta);
    const device = useSession.api.resolve(0, meta);

    if (device instanceof TtyShell && process.pgid !== 0) {
      throw new ShError('background process tried to read tty', 1);
    }

    let result = {} as ReadResult;
    while (!(result = await device.readData(once)).eof) {
      if (result.data !== undefined) {
        yield body(result);
        if (once) break;
      }
      await preProcessRead(process, device);
    }
  }

  private async *read(meta: Sh.BaseMeta, act: (x: any) => any) {
    yield* this.readLoop(meta, (result) => {
      if (isDataChunk(result.data)) {
        let transformed: any, items = [] as any[];
        for (const item of result.data.items) {
          transformed = act(item);
          (transformed !== undefined) && items.push(transformed); 
        }
        result.data.items = items;
        return result.data; // Forward chunk
      } else {
        return act(result.data);
      }
    });
  }

  private async readOnce(meta: Sh.BaseMeta): Promise<ReadResult> {
    for await (const data of this.readLoop(meta, ({ data }) => data, true)) {
      return data;
    }
    return { eof: true };
  }

  private async *split(meta: Sh.BaseMeta) {
    yield* this.readLoop(meta, (result) => {
      if (isDataChunk(result.data)) {
        result.data.items = result.data.items.flatMap(x => x);
        return result.data;
      } else if (Array.isArray(result.data)) {
        return dataChunk(result.data);
      } else {
        return result.data;
      }
    });
  }

  private async *splitBy(meta: Sh.BaseMeta, separator: string) {
    yield* this.readLoop(meta, (result) => {
      if (isDataChunk(result.data)) {
        result.data.items = result.data.items
          .flatMap((x: string) => x.split(separator));
        return result.data;
      } else if (typeof result.data === 'string') {
        return dataChunk(result.data.split(separator));
      } else {
        throw new ShError(`expected string`, 1);
      }
    });
  }

  /** JSON.parse with string fallback */
  private parseJsonArg(input: string) {
    try {
      return input === undefined ? undefined : JSON.parse(input);
    } catch {
      return input;
    }
  }

  /** js parse with string fallbak */
  private parseJsArg(input: string) {
    try {
      return Function(`return ${input}`)();
    } catch (e) {
      return input;
    }
  }

}

export const cmdService = new CmdService;
