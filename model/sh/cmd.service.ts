import { interval, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import cliColumns from 'cli-columns';
import safeJsonStringify from 'safe-json-stringify';
import jsonStringifyPrettyCompact from 'json-stringify-pretty-compact';

import { deepGet, kebabToCamel, testNever, truncate } from 'model/generic.model';
import { asyncIteratorFrom, CoroutineConfig } from 'model/rxjs/asyncIteratorFrom';
import { createStageProxy } from '../stage/stage.proxy';

import type * as Sh from './parse/parse.model';
import { NamedFunction, CoreVar } from './var.model';
import { getProcessStatusIcon, ReadResult, dataChunk, isDataChunk, preProcessRead } from './io/io.model';
import { createKillError, ShError } from './sh.util';
import { cloneParsed, getOpts } from './parse/parse.util';

import useSession, { ProcessStatus } from 'store/session.store';
import useStage from 'store/stage.store';
import { ansiBlue, ansiReset, ansiWhite } from './tty.xterm';

const commandKeys = {
  /** Wait for a stage to be ready */
  'await-stage': true,
  /** Execute a javascript function */
  call: true,
  /** List function definitions */
  defs: true,
  /** Output arguments as space-separated string */
  echo: true,
  /** e.g. `get /brush/sides` from stage store */
  get: true,
  /** List previous commands */
  history: true,
  /** Stream key events from stage */
  key: true,
  kill: true,
  /** List variables, usually created via redirection */
  ls: true,
  poll: true,
  /** List running processes */
  ps: true,
  /** Apply function to each item from stdin */
  map: true,
  run: true,
  /** e.g. `set /brush/sides 6` */
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
  wall: true,
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
      /**
       * TODO rename as `declare`
       */
      case 'defs': {
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
        if (args[0]) {
          const stageKey = useSession.api.getVar(meta.sessionKey, CoreVar.STAGE_KEY);
          yield this.getData(meta.sessionKey, stageKey, args[0]);
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
        const stageKey = useSession.api.getVar(meta.sessionKey, CoreVar.STAGE_KEY);
        const { keyEvents } = useStage.api.getStage(stageKey).internal;
        yield* this.iterateObservable(meta, keyEvents.asObservable());
        break;
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
              p.status = ProcessStatus.Suspended;
            } else if (opts.CONT) {
              p.onResume?.();
              p.status = ProcessStatus.Running;
            } else {
              p.status = ProcessStatus.Killed;
              p.onResume?.();
              setTimeout(() => {
                p.cleanups.forEach(cleanup => cleanup());
                p.cleanups.length = 0;
              });
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
        const delayMs = Math.max(seconds, 0.5) * 1000;
        const observable = interval(delayMs).pipe(map(x => x + 2), startWith(1));
        yield* this.iterateObservable(meta, observable);
        break;
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
      case 'run': {// e.g. await '({ read }) { yield "foo"; yield await read(); }'
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
            useSession.api.addCleanup(meta, () => reject(createKillError(meta)));
            (started = Date.now()) && setTimeout(resolve, ms);
          });
          yield; // Pauses execution if process suspended
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
      case 'wall': {
        const { opts } = getOpts(args, {
          boolean: ['c', /** Cut out */],
          string: ['k', /** Polygon key */],
        });
        const outputs = [] as any[];
        yield* this.read(meta, (data: any[]) => { outputs.push(data); });
        const filtered = outputs.filter(x => x.length === 4 && x.every(Number.isFinite));
        const stageKey = useSession.api.getVar(meta.sessionKey, CoreVar.STAGE_KEY);
        const polygonKey = opts.k || 'default';
        useStage.api.addWalls(stageKey, filtered, { polygonKey, cutOut: opts.c });
        break;
      }
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
        useSession.api.addCleanup(meta, () => reject(createKillError(meta)));
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
          case 'brush': useStage.api.updateBrush(stageKey, {}); break;
          case 'polygon': useStage.api.updatePolygon(stageKey, path[1], {}); break;
          case 'walls': useStage.api.updateWalls(stageKey, {}); break;
          default: useStage.api.updateStage(stageKey, {}); break;
        }
      } else if (first === 'var') {
        const varLookup = useSession.api.getSession(sessionKey).var;
        deepGet(varLookup, path)[last] = data;
      }
    }
  }

  /** Iterate a never-ending observable e.g. key events or polling */
  private async *iterateObservable(meta: Sh.BaseMeta, observable: Observable<any>) {
    const config: CoroutineConfig<any> = { enabled: true };
    const iterator = asyncIteratorFrom(observable, config);
    const process = useSession.api.getProcess(meta);
    process.cleanups.push(() => config.promise?.reject(createKillError(meta)));
    process.onSuspend = () => config.forget?.();
    process.onResume = () => config.remember?.();
    yield* iterator;
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
