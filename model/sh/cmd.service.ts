import cliColumns from 'cli-columns';
import * as THREE from 'three';

import * as Geom from 'model/geom';
import { geom } from 'model/geom.service';
import { testNever, truncate, Deferred, pause, deepClone, keysDeep } from 'model/generic.model';
import { createStageProxy } from '../stage/stage.proxy';

import type * as Sh from './parse/parse.model';
import { NamedFunction, CoreVar } from './var.model';
import { getProcessStatusIcon, ReadResult, dataChunk, isDataChunk, preProcessRead, redirectNode } from './io/io.model';
import { createKillError as killError, ShError } from './sh.util';
import { cloneParsed, getOpts } from './parse/parse.util';
import useSession, { ProcessStatus } from 'store/session.store';
import { ansiBlue, ansiBrown, ansiReset, ansiWhite } from './tty.xterm';

import { StageKeyEvent, StageMeta } from 'model/stage/stage.model';
import useStage from 'store/stage.store';
import { parseService } from './parse/parse.service';
import { Util } from 'model/runtime-utils';
import { vectPrecisionSpecial } from 'model/3d/three.model';

const commandKeys = {
  /** Execute a javascript function */
  call: true,
  cd: true,
  /** Get next click event from stage $STAGE_KEY */
  click: true,
  /** List function definitions */
  declare: true,
  /** Output arguments as space-separated string */
  echo: true,
  /** Exit with code 1 */
  false: true,
  /** Get each arg from stageAndVars */
  get: true,
  /** List commands */
  help: true,
  /** List previous commands */
  history: true,
  /** Stream key events from stage $STAGE_KEY */
  key: true,
  /** Kill a process */
  kill: true,
  /** List variables */
  ls: true,
  /** Output 1, 2, ... at fixed intervals */
  poll: true,
  /** List running processes */
  ps: true,
  pwd: true,
  /** Apply function to each item from stdin */
  map: true,
  /** Exit from a function */
  return: true,
  /** Remove each arg from variables */
  rm: true,
  /** Run a javascript generator */
  run: true,
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
  /** Wait for a stage to be ready */
  stage: true,
  /** Test regex against string */
  test: true,
  /** Exit with code 0 */
  true: true,
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
        const func = Function('__', `return ${args[0]}`);
        yield await func()(
          this.provideStageAndVars(meta),
          ...args.slice(1),
        );
        break;
      }
      case 'cd': {
        if (args.length > 1) {
          throw new ShError('usage: `cd`, `cd stage.opt`, `cd /stage` and `cd -`', 1);
        }
        const prevPwd: string = useSession.api.getVar(meta.sessionKey, 'OLDPWD') || '';
        const currPwd: string = useSession.api.getVar(meta.sessionKey, 'PWD') || '';

        if (!args[0] || args[0] === '/') {
          useSession.api.setVar(meta.sessionKey, 'OLDPWD', currPwd);
          useSession.api.setVar(meta.sessionKey, 'PWD', '');
        } else if (args[0] === '-') {
          useSession.api.setVar(meta.sessionKey, 'OLDPWD', currPwd);
          useSession.api.setVar(meta.sessionKey, 'PWD', prevPwd);
        } else if (args[0] === '..') {
          // We do not attempt to handle '[' properly
          const matches = currPwd.match(/(^.+)\.[^\]\.]+$/);
          if (matches) {
            useSession.api.setVar(meta.sessionKey, 'OLDPWD', currPwd);
            useSession.api.setVar(meta.sessionKey, 'PWD', matches[1]);
          } else if (currPwd.match(/^[^\.\[]+$/)) {
            useSession.api.setVar(meta.sessionKey, 'OLDPWD', currPwd);
            useSession.api.setVar(meta.sessionKey, 'PWD', '');
          }
        } else {
          try {
            const parts = ['__'].concat(args[0][0] === '/'
              ? [args[0].slice(1)]
              : currPwd ? [currPwd, args[0]] : [args[0]]);
            const root = this.provideStageAndVars(meta);
            const dst = Function('__', `return ${parts.join('.')}`)(root);
            if (dst) {
              useSession.api.setVar(meta.sessionKey, 'OLDPWD', currPwd);
              useSession.api.setVar(meta.sessionKey, 'PWD', parts.slice(1).join('.'));
            } else throw new Error;
          } catch (e) {
            throw new ShError(`${args[0]} not found`, 1);
          }
        }
        break;
      }
      case 'click': {
        const numClicks = args[0] === undefined ? 1 : Number(args[0]);
        if (!Number.isFinite(numClicks)) throw new ShError('format: click [numberOfClicks]', 1);

        const process = useSession.api.getProcess(meta);
        let [resolve, reject] = [(_: THREE.Vector3) => {}, (_: any) => {}];
        const sub = this.getSessionStage(meta.sessionKey).root.ptr.subscribe({
           next: (e) => {
             if (e.key === 'pointerup' && process.status === ProcessStatus.Running) {
               resolve(vectPrecisionSpecial(e.point.clone()));
             }
           },
         });
         process.cleanups.push(() => sub.unsubscribe(), () => reject(killError(meta)));

        for (let i = 0; i < numClicks; i++) {
          yield await new Promise((res, rej) => [resolve, reject] = [res, rej]);
        }
        sub.unsubscribe();
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
        try {
          const root = this.provideStageAndVars(meta);
          const cwd = this.computeCwd(meta, root);
          const outputs = args.map(arg => {
            if (arg[0] === '/') return Function('__', `return __.${arg.slice(1)}`)(root);
            return Function('__', `return __.${arg}`)(cwd)
          });
          node.exitCode = outputs.length && outputs.every(x => x === undefined) ? 1 : 0;
          for (const output of outputs) yield output;
        } catch (e) {
          throw new ShError(`${e}`.replace('__.', ''), 1);
        }
        break;
      }
      case 'help': {
        const { ttyShell } = useSession.api.getSession(meta.sessionKey);
        yield `1) The following commands are supported:`;
        const commands = cliColumns(Object.keys(commandKeys), { width: ttyShell.xterm.xterm.cols }).split(/\r?\n/);
        for (const line of commands) yield `${ansiBlue}${line}`;
        yield `2) Traverse the stage/variables via \`ls\` or e.g. \`ls -l stage.opt\`.`
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
      case 'key': {
        let deferred: Deferred<StageKeyEvent>;
        const process = useSession.api.getProcess(meta);
        const sub = this.getSessionStage(meta.sessionKey).root.key
          .subscribe({ // Ignore signals while paused
            next: (e) => process.status === ProcessStatus.Running && deferred.resolve(e),
          });
        process.cleanups.push(() => sub.unsubscribe(), () => deferred.reject(killError(meta)));
        while (true)
          yield await (deferred = new Deferred<StageKeyEvent>()).promise; 
      }
      case 'kill': {
        const { opts, operands } = getOpts(args, { boolean: [
          'STOP', /** --STOP */
          'CONT', /** --CONT */
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
          'a', /** Show caps keys at root? */
        ], });
        const root = this.provideStageAndVars(meta);
        const cwd = this.computeCwd(meta, root);

        // We usually treat -1 as a numeric operand, but it is an option here
        const queries = operands.filter(x => !x.startsWith('-'));
        if (!queries.length) queries.push('');
        const roots = queries.map(x => {
          if (x[0] === '/') {
            return x.slice(1) ? Function('__', `return __.${x.slice(1)}`)(root) : root;
          }
          return x ? Function('__', `return __.${x}`)(cwd) : cwd;
        });

        const { ttyShell } = useSession.api.getSession(node.meta.sessionKey);
        for (const [i, obj] of roots.entries()) {
          if (obj === undefined) {
            useSession.api.warn(meta.sessionKey, `ls: ${queries[i]} is not defined`);
            continue;
          }
          if (roots.length > 1) yield `${ansiBlue}${queries[i]}:`;
          let keys = (opts.r ? keysDeep(obj) : Object.keys(obj)).sort();
          if (obj === root && !opts.a) {
            keys = keys.filter(x => x !== x.toUpperCase());
          }
          let items = [] as string[];
          if (opts.l) {
            if (typeof obj === 'function') keys = keys.filter(x => !['caller', 'callee', 'arguments'].includes(x));
            const metas = keys.map(x => obj[x]?.constructor?.name || (obj[x] === null ? 'null' : 'undefined'));
            const metasWidth = Math.max(...metas.map(x => x.length));
            items = keys.map((x, i) => `${ansiBrown}${metas[i].padEnd(metasWidth)}${ansiWhite} ${x}`);
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
        const { opts, operands } = getOpts(args, { boolean: [
          'x', /** Permit extended func def, see function `filter` */
        ], });
        const funcDef = operands[0];
        const func =  Function('__v__', opts.x ? funcDef : `return ${funcDef}`);
        yield* this.read(meta, (data) => func()(data, this.provideStageAndVars(meta)));
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
        yield useSession.api.getVar(meta.sessionKey, 'PWD') || '';
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
        const root = this.provideStageAndVars(meta);
        const cwd = this.computeCwd(meta, root);
        for (const arg of args) {
          if (arg === '/') {
            throw new ShError('cannot delete root', 1);
          } else if (arg[0] === '/') {
            Function('__', `delete __.${arg.slice(1)}`)(root);
          } else {
            Function('__', `delete __.${arg}`)(cwd);
          }
        }
        break;
      }
      /** e.g. run '({ read }) { yield "foo"; yield await read(); }' */
      case 'run': {
        const func = Function('_', `return async function *generator ${args[0]}`);
        yield* func()(
          this.provideRunApi(meta),
          this.provideStageAndVars(meta),
          ...args.slice(1),
        );
        break;
      }
      case 'set': {
        const root = this.provideStageAndVars(meta);
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
          yield; // Pause execution if process suspended
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
      case 'stage': {
        const stageKey = this.parseJsonArg(args[0]);
        await new Promise<void>(resolve => {
          useStage.api.awaitStage(stageKey, resolve);
          useSession.api.addCleanup(meta, resolve);
        });
        break;
      }
      case 'test': {
        const regex = Function('__v__', `return ${args[0]}`)() as RegExp;
        const value = args[1];
        node.exitCode = 1;
        regex.test(value) && (node.exitCode = 0);
        break;
      }
      case 'true': {
        node.exitCode = 0;
        break;
      }
      default: throw testNever(command);
    }
  }

  private computeCwd(meta: Sh.BaseMeta, root: any) {
    const prefix = useSession.api.getVar(meta.sessionKey, 'PWD');
    return Function('__', `return __${prefix ? `.${prefix}` : ''}`)(root);    
  }

  private getSessionStage(sessionKey: string) {
    return useStage.api.getStage(
      useSession.api.getVar(sessionKey, CoreVar.STAGE_KEY)
    );
  }

  async launchFunc(node: Sh.CallExpr, namedFunc: NamedFunction, args: string[]) {
    const cloned = cloneParsed(namedFunc.node);
    const { ttyShell } = useSession.api.getSession(node.meta.sessionKey);
    Object.assign(cloned.meta, { ...node.meta, ppid: node.meta.pid } as Sh.BaseMeta);
    await ttyShell.spawn(cloned, { posPositionals: args.slice() });
  }

  private provideRunApi(meta: Sh.BaseMeta) {
    return {
      // We convert { eof: true } to null, for truthy test
      read: async () => {
        const result = await this.readOnce(meta);
        return result?.eof ? null : result;
      },
      readAll: async () => {
        let msg: ReadResult, msgs = [] as any[];
        do {
          msg = await this.readOnce(meta);
          !msg.eof && msgs.push(msg);
        } while (!msg.eof);
        return msgs;
      },
      // TODO support pause/resume like command `sleep`
      sleep: (seconds: number) => new Promise<void>((resolve, reject) => {
        setTimeout(resolve, seconds * 1000);
        useSession.api.addCleanup(meta, () => reject(killError(meta)));
      }),
      spawn: async (command: string) => {
        const { ttyShell } = useSession.api.getSession(meta.sessionKey);
        const parsed = Object.assign(parseService.parse(command), { meta: deepClone(meta) });
        const device = useSession.api.createSinkDevice(meta.sessionKey, `pid-${meta.pid}`);
        redirectNode(parsed, { 1: device.key });
        await ttyShell.spawn(parsed);
        useSession.api.removeDevice(device.key);
        return device.items.slice();
      },
      /** Trick to provide local variables via destructuring */
      _: {},
    };
  }

  private provideStageAndVars(meta: Sh.BaseMeta): {
    stage: StageMeta;
    use: any;
  } & Record<string, any> {
    const stageKey = useSession.api.getVar(meta.sessionKey, CoreVar.STAGE_KEY);
    const varLookup = useSession.api.getSession(meta.sessionKey).var;
    return new Proxy({
      ...varLookup,
      stage: createStageProxy(stageKey),
      use: this.useProxy,
    }, {
      deleteProperty: (_, key: string) => {
        if (key === 'stage' || key === 'use') return false;
        return delete varLookup[key];
      },
    });
  }

  private async *readLoop(
    meta: Sh.BaseMeta,
    body: (res: ReadResult) => any,
    /** Read exactly one item of data? */
    once = false,
  ) {
    const process = useSession.api.getProcess(meta);
    const device = useSession.api.resolve(0, meta);

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

  /**
   * Expose classes/services
   */
  private useProxy = new Proxy({} as {
    geom: typeof geom;
    Geom: typeof Geom;
    THREE: typeof THREE;
    Util: typeof Util;
  }, {
    get(_, key: 'geom' | 'Geom' | 'THREE' | 'Util')  {
      switch (key) {
        case 'geom': return geom;
        case 'Geom': return Geom;
        case 'THREE': return THREE;
        case 'Util': return Util;
        default: return (_ as any)[key];
      }
    },
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    ownKeys: () => ['geom', 'Geom', 'THREE', 'Util'],
  });
  
}

export const cmdService = new CmdService;
