import { interval, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { testNever, truncate } from 'model/generic.model';
import { asyncIteratorFrom, Bucket } from 'model/rxjs/asyncIteratorFrom';

import type * as Sh from './parse/parse.model';
import { NamedFunction } from "./var.model";
import { getProcessStatusIcon, ReadResult, SigEnum, dataChunk, isDataChunk, Device, preProcessRead } from './io/io.model';
import { ProcessError, ShError } from './sh.util';
import { cloneParsed, getOpts } from './parse/parse.util';

import useSession, { ProcessStatus } from 'store/session.store';
import useStage from 'store/stage.store';
import { ansiBlue, ansiReset, ansiWhite } from './tty.xterm';

const commandKeys = {
  await: true,
  call: true,
  /** Output a variable */
  // cat: true,
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
  // /** Read one item from stdin and write to stdout */
  // read: true,
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
  
  async *runCmd(node: Sh.CallExpr, command: CommandName, args: string[]) {
    const { meta } = node;
    switch (command) {
      case 'await': {
        /**
         * TODO
         */
        break;
      }
      case 'call': {
        const func = Function('_', `return ${args[0]}`);
        const varProxy = this.createVarProxy(meta.sessionKey);
        yield func()(varProxy, ...args.slice(1));
        break;
      }
      // case 'cat': {
      //   for (const arg of args) {
      //     const value = useSession.api.getVar(meta.sessionKey, arg);
      //     if (value === undefined) throw new ShError(`${arg}: variable not found`, 1);
      //     for (const item of Array.isArray(value) ? value : [value]) yield item;
      //   }
      //   break;
      // }
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
          yield useSession.api.getData(meta.sessionKey, args[0]);
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
        const { keyEvents } = useStage.api.getStage(meta.sessionKey);
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
          'x', /** Extended func def */
        ], });
        const funcDef = operands[0];
        const func =  Function('__v__', opts.x ? funcDef : `return ${funcDef}`);
        const vp = this.createVarProxy(meta.sessionKey);
        const sp = this.createStageProxy(meta.sessionKey);
        yield* this.read(node, (data) => func()(data, sp, vp));
        break;
      }
      case 'ls': {
        const kvPairs = useSession.api.getVars(meta.sessionKey);
        for (const { key, value: _ } of kvPairs) yield key;
        break;
      }
      case 'poll': {
        const seconds = args.length ? parseFloat(this.parseArg(args[0])) || 0 : 1;
        const delayMs = Math.max(seconds, 0.5) * 1000;
        const observable = interval(delayMs).pipe(map(x => x + 1),startWith(0));
        yield* this.iterateObservable(meta, observable);
        break;
      }
      case 'ps': {
        const { opts } = getOpts(args, { boolean: [
          'a', /** Show all processes */
        ], });
        const processes = Object.values(useSession.api.getProcesses(meta.sessionKey))
          .filter(opts.a ? x => x : ({ key: pid, pgid }) => pid === pgid);
        const title = ['pid', 'ppid', 'pgid'].map(x => x.padEnd(5)).join(' ')
        yield `${ansiBlue}${title}${ansiReset}`;
        for (const { key: pid, ppid, pgid, status, src } of processes) {
          const icon = getProcessStatusIcon(status);
          const info = [pid, ppid, pgid].map(String).map(x => x.padEnd(5)).join(' ')
          yield `${info}${icon}  ${truncate(src, 40)}`;
        }
        break;
      }
      // case 'read': {
      //   const varName = varRegex.test(args[0]) ? args[0] : null;
      //   let varValue = undefined as any;
      //   for await (varValue of this.readOnce(node));
        
      //   if (varName !== null) useSession.api.setVar(meta.sessionKey, varName, varValue);
      //   node.exitCode = varValue !== undefined ? 0 : 1;
      //   break;
      // }
      case 'set': {
        const value = this.parseArg(args[1]);
        yield useSession.api.setData(meta.sessionKey, args[0], value);
        break;
      }
      case 'sleep': {
        const seconds = args.length ? parseFloat(this.parseArg(args[0])) || 0 : 1;
        const process = useSession.api.getProcess(meta);
        await new Promise<void>((resolve, reject) => {
          process.onResume = resolve;
          useSession.api.addCleanup(meta, () => reject(new ProcessError(
            SigEnum.SIGKILL, meta.pid, meta.sessionKey)));
          setTimeout(resolve, 1000 * seconds);
        });
        break;
      }
      case 'split': {
        const arg = this.parseArg(args[0]);
        yield* arg === undefined ? this.split(node) : this.splitBy(node, arg);
        break;
      }
      case 'sponge': {
        const outputs = [] as any[];
        yield* this.read(node, (data: any[]) => { outputs.push(data); });
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
        const { opts } = getOpts(args, { boolean: ['c', /** Cut out */ ], });
        const outputs = [] as any[];
        yield* this.read(node, (data: any[]) => { outputs.push(data); });
        const filtered = outputs.filter(x => x.length === 4 && x.every(Number.isFinite));
        useStage.api.addWalls(meta.sessionKey, filtered, { cutOut: opts.c });
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

  private createStageProxy(stageKey: string) {
    return new Proxy({}, {
      get: (_, varName: string) => {
        if (varName === 'update') {
          return () => useStage.api.updateStage(stageKey, {});
        }
        const stage = useStage.api.getStage(stageKey);
        return varName in stage ? stage[varName as keyof typeof stage] : undefined;
      },
      ownKeys: () => Object.keys(useStage.api.getStage(stageKey)).concat('update'),
      getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    });
  }

  private createVarProxy(sessionKey: string) {
    return new Proxy({}, {
      get: (_, varName: string) => useSession.api.getVar(sessionKey, varName),
      set: (_, varName: string, value) => {
        useSession.api.setVar(sessionKey, varName, value);
        return true;
      },
      ownKeys: () => Object.keys(useSession.api.getSession(sessionKey).var),
      getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
    });
  }

  isCmd(word: string): word is CommandName {
    return word in commandKeys;
  }

  /** Iterate a never-ending observable e.g. key events or polling */
  private async *iterateObservable(meta: Sh.BaseMeta, observable: Observable<any>) {
    const bucket: Bucket<any> = { enabled: true };
    const generator = asyncIteratorFrom(observable, bucket);
    useSession.api.mutateProcess(meta, (p) => {
      p.cleanups.push(() => bucket.promise?.reject(
        new ProcessError(SigEnum.SIGKILL, meta.pid, meta.sessionKey)));
      p.onSuspend = () => bucket.forget?.();
      p.onResume = () => bucket.remember?.();
    });
    for await (const item of generator) {
      yield item;
    }
  }

  private async *readLoop(
    meta: Sh.BaseMeta,
    body: (res: ReadResult) => any,
    /** Read exactly one item of data? */
    once = false
  ) {
    const process = useSession.api.getProcess(meta);
    const device = useSession.api.resolve(0, meta);

    let result = {} as ReadResult;
    while (!(result = await device.readData(once)).eof) {
      if (result.data !== undefined) {
        yield body(result);
      }
      await preProcessRead(process, device);
    }
  }

  private async *read({ meta }: Sh.CallExpr, act: (x: any) => any) {
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

  private async *readOnce({ meta }: Sh.CallExpr) {
    yield* this.readLoop(meta, ({ data }) => data, true);
  }

  private async *split({ meta }: Sh.CallExpr) {
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

  private async *splitBy({ meta }: Sh.CallExpr, separator: string) {
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
  private parseArg(x: any) {
    try {
      return x === undefined ?  undefined : JSON.parse(x);
    } catch {
      return JSON.parse(`"${x}"`)
    }
  }
  
}

export const cmdService = new CmdService;
