import { testNever, truncate } from 'model/generic.model';
import { asyncIteratorFrom, Bucket } from 'model/rxjs/asyncIteratorFrom';

import type * as Sh from './parse/parse.model';
import { NamedFunction, varRegex } from "./var.model";
import { getProcessStatusIcon, handleProcessStatus, ReadResult, SigEnum } from './io/io.model';
import { dataChunk, isDataChunk } from './io/fifo.device';
import { ProcessError, ShError } from './sh.util';
import { getOpts } from './parse/parse.util';

import useSession, { ProcessStatus } from 'store/session.store';
import useStage from 'store/stage.store';
import { ansiBlue, ansiReset, ansiWhite } from './tty.xterm';

const commandKeys = {
  call: true,
  /** Output a variable */
  cat: true,
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
  /** List running processes */
  ps: true,
  /** Apply function to each item from stdin */
  map: true,
  /** Read one item from stdin and write to stdout */
  read: true,
  /** e.g. `set /brush/sides 6` */
  set: true,
  /** Wait for specified number of seconds */
  sleep: true,
  /**
   * Split arrays from stdin into items.
   * Alternatively split strings by provided separator.
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

  private async *read(
    { meta }: Sh.CallExpr,
    act: (data: any) => any,
    { once }: { once?: boolean } = {}
  ) {
    const device = useSession.api.resolve(meta.stdIn, meta.pid);
    let result = {} as ReadResult;

    while (!(result = await device.readData(once)).eof) {
      if (result.data === undefined) {
        continue;
      } else if (isDataChunk(result.data)) {
        let transformed: any, items = [] as any[];
        for (const item of result.data.items) {
          transformed = act(item);
          (transformed !== undefined) && items.push(transformed); 
        }
        result.data.items = items;
        yield result.data; // Forward chunk
      } else {
        yield act(result.data);
        if (once) break;
      }
    }
  }

  private async *split({ meta }: Sh.CallExpr) {
    const device = useSession.api.resolve(meta.stdIn, meta.pid);
    let result = {} as ReadResult;
    while (!result.eof) {
      result = await device.readData();
      if (result.data) {
        if (isDataChunk(result.data)) {
          result.data.items = result.data.items.flatMap(x => x);
          yield result.data;
        } else if (Array.isArray(result.data)) {
          yield dataChunk(result.data);
        } else {
          yield result.data;
        }
      }
    }
  }

  private async *splitBy({ meta }: Sh.CallExpr, separator: string) {
    const device = useSession.api.resolve(meta.stdIn, meta.pid);
    let result = {} as ReadResult;
    while (!result.eof) {
      result = await device.readData();
      if (result.data !== undefined) {
        if (isDataChunk(result.data)) {
          result.data.items = result.data.items
            .flatMap((x: string) => x.split(separator));
          yield result.data;
        } else if (typeof result.data === 'string') {
          yield dataChunk(result.data.split(separator));
        } else {
          throw new ShError(`expected string`, 1);
        }
      }
    }
  }

  /** JSON.parse with string fallback */
  private parseArg(x: any) {
    try {
      return x === undefined ?  undefined : JSON.parse(x);
    } catch {
      return JSON.parse(`"${x}"`)
    }
  }
  
  async *runCmd(node: Sh.CallExpr, command: CommandName, args: string[]) {
    const { meta } = node;
    switch (command) {
      case 'call': {
        const func = Function('_', `return ${args[0]}`);
        const varProxy = this.createVarProxy(meta.sessionKey);
        yield func()(varProxy, ...args.slice(1));
        break;
      }
      case 'cat': {
        for (const arg of args) {
          const value = useSession.api.getVar(meta.sessionKey, arg);
          if (value === undefined) throw new ShError(`${arg}: variable not found`, 1);
          for (const item of Array.isArray(value) ? value : [value]) yield item;
        }
        break;
      }
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
          yield useStage.api.getData(meta.sessionKey, args[0]);
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
        const bucket: Bucket<any> = { enabled: true };
        const generator = asyncIteratorFrom(keyEvents.asObservable(), bucket);
        useSession.api.mutateProcess(meta.pid, (p) => {
          p.cleanups.push(() => bucket.promise?.reject(new ProcessError(SigEnum.SIGKILL, meta.pid)));
          p.onSuspend = () => bucket.forget?.();
          p.onResume = () => bucket.remember?.();
        });
        for await (const item of generator) yield item;
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
              p.cleanups.forEach(cleanup => cleanup());
              p.cleanups.length = 0;
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
      case 'ps': {
        const { opts } = getOpts(args, { boolean: [
          'a', /** Show all processes */
        ], });
        const processes = Object.values(useSession.getState().process)
          .filter(x => x.sessionKey === meta.sessionKey)
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
      case 'read': {
        const varName = varRegex.test(args[0]) ? args[0] : null;
        let varValue = undefined as any;
        yield* this.read(node, input => {
          if (input !== undefined) varValue = input;
        }, { once: true });
        varName && useSession.api.setVar(meta.sessionKey, varName, varValue);
        node.exitCode = varValue ? 0 : 1;
        break;
      }
      case 'set': {
        const value = this.parseArg(args[1]);
        yield useStage.api.setData(meta.sessionKey, args[0], value);
        break;
      }
      case 'sleep': {
        const seconds = args.length ? parseFloat(this.parseArg(args[0])) || 0 : 1;
        const process = useSession.api.getProcess(meta.pid);
        await new Promise<void>((resolve, reject) => {
          process.onResume = resolve;
          process.cleanups.push(() =>
            reject(new ProcessError(SigEnum.SIGKILL, meta.pid)));
          setTimeout(resolve, 1000 * seconds);
        });
        // Perhaps only need to handle suspension?
        await handleProcessStatus(meta.pid);
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

  async invokeFunc(node: Sh.CallExpr, namedFunc: NamedFunction, args: string[]) {
    const { sessionKey, ppid } = node.meta;
    Object.assign(namedFunc.node.meta, {
      ...node.meta,
      pid: useSession.api.getNextPid(sessionKey),
      ppid,
    });
    const { ttyShell } = useSession.api.getSession(sessionKey);
    await ttyShell.spawn(namedFunc.node, {
      posPositionals: args.slice(),
    });
  }
}

export const cmdService = new CmdService;
