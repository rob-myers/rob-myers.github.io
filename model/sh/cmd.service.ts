import cliColumns from 'cli-columns';
import safeJsonStringify from 'safe-json-stringify';
import jsonStringifyPrettyCompact from 'json-stringify-pretty-compact';

import { deepGet, kebabToCamel, testNever, truncate, Deferred, pause } from 'model/generic.model';
import { createStageProxy } from '../stage/stage.proxy';

import type * as Sh from './parse/parse.model';
import { NamedFunction, CoreVar } from './var.model';
import { getProcessStatusIcon, ReadResult, dataChunk, isDataChunk, preProcessRead } from './io/io.model';
import { createKillError as killError, ShError } from './sh.util';
import { cloneParsed, getOpts } from './parse/parse.util';
import useSession, { ProcessStatus } from 'store/session.store';
import { ansiBlue, ansiReset, ansiWhite } from './tty.xterm';

import { StageKeyEvent } from 'model/stage/stage.model';
import useStage from 'store/stage.store';

const commandKeys = {
  /** Wait for a stage to be ready */
  'await-stage': true,
  /** Execute a javascript function */
  call: true,
  /** List function definitions */
  declare: true,
  /** Output arguments as space-separated string */
  echo: true,
  /** Get a variable or something from stage $STAGE_KEY */
  get: true,
  /** List previous commands */
  history: true,
  /** Stream key events from stage $STAGE_KEY */
  key: true,
  /** Kill a process */
  kill: true,
  /** List variables, usually created via redirection */
  ls: true,
  /** Outpus 1, 2, ... at fixed intervals */
  poll: true,
  /** List running processes */
  ps: true,
  /** Apply function to each item from stdin */
  map: true,
  /** Exit from a function */
  return: true,
  /** Run a javascript generator */
  run: true,
  /** Set a variable of something in stage $STAGE_KEY */
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
  /** Test regex against string */
  test: true,
  // wall: true,
};
type CommandName = keyof typeof commandKeys;

class CmdService {

  isCmd(word: string): word is CommandName {
    return word in commandKeys;
  }
  
  async *runCmd(node: Sh.CallExpr, command: CommandName, args: string[]) {
    const { meta } = node;
    switch (command) {
      case 'await-stage': {
        const stageKey = this.parseArg(args[0]);
        await new Promise<void>(resolve => {
          useStage.api.awaitStage(stageKey, resolve);
          useSession.api.addCleanup(meta, resolve);
        });
        break;
      }
      case 'call': {
        const func = Function('_', `return ${args[0]}`);
        yield await func()(
          this.provideStageAndVars(meta),
          ...args.slice(1),
        );
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
      case 'get': {
        const stageKey = useSession.api.getVar(meta.sessionKey, CoreVar.STAGE_KEY);
        for (const arg of args) {
          yield this.getData(meta.sessionKey, stageKey, arg);
        }
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
        const sub = useStage.api.getStage(
          useSession.api.getVar(meta.sessionKey, CoreVar.STAGE_KEY)
        ).internal.keyEvents.subscribe({ // Ignore signals while paused
          next: (e) => process.status === ProcessStatus.Running && deferred.resolve(e),
        });
        process.cleanups.push(() => sub.unsubscribe(), () => deferred.reject(killError(meta)));
        while (true) yield await (deferred = new Deferred<StageKeyEvent>()).promise; 
      }
      case 'kill': {
        const { opts, operands } = getOpts(args, { boolean: [
          'STOP', /** --STOP */
          'CONT', /** --CONT */
        ] });
        const pgids = operands.map(x => this.parseArg(x))
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
              setTimeout(() => { while (p.cleanups.pop()?.()); });
            }
          });
        }
        break;
      }
      case 'map': {
        const { opts, operands } = getOpts(args, { boolean: [
          'x', /** Permit extended func def, see function `filter` */
        ], });
        const funcDef = operands[0];
        const func =  Function('__v__', opts.x ? funcDef : `return ${funcDef}`);
        yield* this.read(meta, (data) => func()(data, { util: {...this.jsUtil} }));
        break;
      }
      case 'ls': {
        const { opts, operands } = getOpts(args, { boolean: [
          '1', /** One line per item */
        ], });
        const { stage, var: varLookup } = this.provideStageAndVars(meta);
        let items = Object.keys(varLookup).map(x => `var/${x}`)
          .concat(Object.keys(stage).map(x => `stage/${x}`)).sort();

        // We usually treat -1 as an operand, but it is an option here
        const prefix = operands.find(x => !x.startsWith('-'));
        prefix && (items = items.filter(x => x.startsWith(prefix)));
        if (!opts[1]) {
          const { ttyShell } = useSession.api.getSession(node.meta.sessionKey);
          items = cliColumns(items, { width: ttyShell.xterm.xterm.cols }).split(/\r?\n/);
        }

        for (const item of items) yield item;
        break;
      }
      case 'poll': {
        const seconds = args.length ? parseFloat(this.parseArg(args[0])) || 0 : 1;
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

        if (!opts.s) {
          yield `${ansiBlue}${title}${ansiReset}`;
          for (const { key: pid, ppid, pgid, status, src } of processes) {
            const icon = getProcessStatusIcon(status);
            const info = [pid, ppid, pgid].map(String).map(x => x.padEnd(5)).join(' ')
            yield `${info}${icon}  ${truncate(src, 30)}`;
          }
        } else {
          for (const { key: pid, ppid, pgid, status, src } of processes) {
            const icon = getProcessStatusIcon(status);
            const info = [pid, ppid, pgid].map(String).map(x => x.padEnd(5)).join(' ')
            yield `${ansiBlue}${title}${ansiReset}`;
            yield `${info}${icon}`;
            yield src + '\n';
          }
        }
        break;
      }
      case 'return': {
        const process = useSession.api.getProcess(meta);
        process.status = ProcessStatus.Killed;
        process.onResume?.();
        process.onSuspend = process.onResume = null;
        break;
      }
      /**
       * e.g. run '({ read }) { yield "foo"; yield await read(); }'
       */
      case 'run': {
        const func = Function('_', `return async function *generator ${args[0]}`);
        yield* func()(
          this.provideJsApi(meta),
          this.provideStageAndVars(meta),
          ...args.slice(1),
        );
        break;
      }
      case 'set': {
        const stageKey = useSession.api.getVar(meta.sessionKey, CoreVar.STAGE_KEY);
        const value = this.parseArg(args[1]);
        yield this.setData(meta.sessionKey, stageKey, args[0], value);
        break;
      }
      case 'sleep': {
        const process = useSession.api.getProcess(meta);
        let ms = 1000 * (args.length ? parseFloat(this.parseArg(args[0])) || 0 : 1);
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
        const arg = this.parseArg(args[0]);
        yield* arg === undefined ? this.split(meta) : this.splitBy(meta, arg);
        break;
      }
      case 'sponge': {
        const outputs = [] as any[];
        yield* this.read(meta, (data: any[]) => { outputs.push(data); });
        yield outputs;
        break;
      }
      case 'test': {
        const regex = Function('__v__', `return ${args[0]}`)() as RegExp;
        const value = args[1];
        node.exitCode = 1;
        regex.test(value) && (node.exitCode = 0);
        break;
      }
      // case 'wall': {
      //   const { opts } = getOpts(args, {
      //     boolean: ['c', /** Cut out */],
      //     string: ['k', /** Polygon key */],
      //   });
      //   const outputs = [] as any[];
      //   yield* this.read(meta, (data: any[]) => { outputs.push(data); });
      //   const filtered = outputs.filter(x => x.length === 4 && x.every(Number.isFinite));
      //   const stageKey = useSession.api.getVar(meta.sessionKey, CoreVar.STAGE_KEY);
      //   const polygonKey = opts.k || 'default';
      //   useStage.api.addWalls(stageKey, filtered, { polygonKey, cutOut: opts.c });
      //   break;
      // }
      default: throw testNever(command);
    }
  }

  async launchFunc(node: Sh.CallExpr, namedFunc: NamedFunction, args: string[]) {
    const cloned = cloneParsed(namedFunc.node);
    const { ttyShell } = useSession.api.getSession(node.meta.sessionKey);
    Object.assign(cloned.meta, {
      ...node.meta,
      ppid: node.meta.pid,
    } as Sh.BaseMeta);
    await ttyShell.spawn(cloned, { posPositionals: args.slice() });
  }

  private jsUtil = {
    stringify: (...args: Parameters<typeof safeJsonStringify>) =>
      jsonStringifyPrettyCompact(JSON.parse(safeJsonStringify(...args))),
  };

  private provideJsApi(meta: Sh.BaseMeta) {
    return {
      // For js API we convert { eof: true } to null, for truthy test
      read: async () => {
        const result = await this.readOnce(meta);
        return result.eof ? null : result;
      },
      sleep: (seconds: number) => new Promise<void>((resolve, reject) => {
        setTimeout(resolve, seconds * 1000);
        useSession.api.addCleanup(meta, () => reject(killError(meta)));
      }),
      /** Trick to provide local variables via destructuring */
      _: {},
    };
  }

  private provideStageAndVars(meta: Sh.BaseMeta) {
    const stageKey = useSession.api.getVar(meta.sessionKey, CoreVar.STAGE_KEY);
    return {
      stage: createStageProxy(stageKey),
      var: useSession.api.getSession(meta.sessionKey).var,
    };
  }

  private getData(sessionKey: string, stageKey: string, pathStr: string) {
    const [ first, ...path] = pathStr.split('/').map(kebabToCamel).filter(Boolean);
    if  (first === 'stage') {
     const stage = useStage.api.getStage(stageKey);
     return deepGet(stage, path);
   } else if (first === 'var') {
     const varLookup = useSession.api.getSession(sessionKey).var;
     return deepGet(varLookup, path);
   }
  }

  private setData(sessionKey: string, stageKey: string, pathStr: string, data: any) {
    const [ first, ...path] = pathStr.split('/').map(kebabToCamel).filter(Boolean);
    if (path.length) {
      const last = path.pop()!;
      if (first === 'stage') {
        const stage = useStage.api.getStage(stageKey);
        if (path.length === 0) throw new Error('stage: cannot set any top-level key');
        deepGet(stage, path)[last] = data;
        switch (path[0]) {
          case 'opts': useStage.api.updateOpts(stageKey, {}); break;
          default: useStage.api.updateStage(stageKey, {}); break;
        }
      } else if (first === 'var') {
        const varLookup = useSession.api.getSession(sessionKey).var;
        deepGet(varLookup, path)[last] = data;
      }
    }
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
  private parseArg(x: string) {
    try {
      return x === undefined ? undefined : JSON.parse(x);
    } catch {
      return x;
    }
  }
  
}

export const cmdService = new CmdService;
