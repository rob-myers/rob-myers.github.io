import shortid from 'shortid';

import { flatten, testNever } from 'model/generic.model';
import { asyncIteratorFrom, Bucket } from 'model/rxjs/asyncIteratorFrom';

import type * as Sh from './parse/parse.model';
import { NamedFunction } from "./var.model";
import { handleProcessStatus, ReadResult } from './io/io.model';
import { dataChunk, isDataChunk } from './io/fifo.device';
import { ShError } from './sh.util';
import { getOpts } from './parse/parse.util';

import useSession from 'store/session.store';
import useStage from 'store/stage.store';

const commandKeys = {
  /** Output a variable */
  cat: true,
  /** List function definitions */
  defs: true,
  /** Output arguments as space-separated string */
  echo: true,
  /** Filter stdin */
  filter: true,
  /** Flatten stdin */
  flat: true,
  /** e.g. `get /brush/sides` from stage store */
  get: true,
  /** List previous commands */
  history: true,
  key: true,
  /** List variables, usually created via redirection */
  ls: true,
  /** Apply function to each item from stdin */
  map: true,
  /** Reduce over all stdin */
  reduce: true,
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

  private async *read({ meta }: Sh.CallExpr, act: (data: any) => any) {
    const device = useSession.api.resolve(meta.stdIn, meta.processKey);
    let result = {} as ReadResult;
    while (!result.eof) {
      result = await device.readData();
      if (result.data !== undefined) {
        if (isDataChunk(result.data)) {
          result.data.items = result.data.items
            .map(act).filter(x => x !== undefined);
          yield result.data; // Forward chunk
        } else {
          yield act(result.data);
        }
      }
    }
  }

  private async *split({ meta }: Sh.CallExpr) {
    const device = useSession.api.resolve(meta.stdIn, meta.processKey);
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
    const device = useSession.api.resolve(meta.stdIn, meta.processKey);
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
      case 'cat': {
        for (const arg of args) {
          const value = useSession.api.getVar(meta.sessionKey, arg);
          if (value === undefined) {
            throw new ShError(`${arg}: variable not found`, 1);
          }
          for (const item of Array.isArray(value) ? value : [value]) {
            yield item;
          }
        }
        break;
      }
      case 'defs': {
        const funcs = useSession.api.getFuncs(meta.sessionKey);
        for (const { key, src } of funcs) {
          yield `${key} () {`;
          yield `${src!.slice(2)}\n`; // multiline src starts with {\n
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
      case 'flat': {
        yield* this.read(node, (data) => Array.isArray(data)
          ? flatten(data)
          : data);
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
        const bucket = {} as Bucket<any>;
        const generator = asyncIteratorFrom(keyEvents.asObservable(), bucket);
        useSession.api.getProcess(meta.processKey).cleanups
          .push(() => bucket.promise?.reject());
        try {
          for await (const item of generator) yield item;
        } catch {
          throw null;
        }
        break;
      }
      case 'filter':
      case 'map':
      case 'reduce': {
        if (args.length === 0) {
          throw new ShError('1st arg must be a function', 1);
        }
        const funcDef = args[0];
        const func = Function('_', `return ${funcDef}`);
        const vp = this.createVarProxy(meta.sessionKey);
        const sp = this.createStageProxy(meta.sessionKey);

        if (command === 'filter') {
          yield* this.read(node, (data) => func()(data, sp, vp) ? data : undefined);
        } else if (command === 'map') {
          yield* this.read(node, (data) => func()(data, sp, vp));
        } else {
          if (args.length <= 2) {
            if (command === 'reduce') {// `reduce` over all inputs
              const outputs = [] as any[];
              yield* this.read(node, (data: any[]) => { outputs.push(data); });
              yield args[1]
                ? outputs.reduce((agg, item) => func()(agg, item), this.parseArg(args[1]))
                : outputs.reduce((agg, item) => func()(agg, item));
            }
            break;
          } else {
            throw new ShError('expected at most two args', 1);
          }
        }
        break;
      }
      case 'ls': {
        const kvPairs = useSession.api.getVars(meta.sessionKey);
        for (const { key, value: _ } of kvPairs) {
          yield key;
        }
        break;
      }
      case 'set': {
        const value = this.parseArg(args[1]);
        yield useStage.api.setData(meta.sessionKey, args[0], value);
        break;
      }
      case 'sleep': {
        const seconds = args.length ? parseFloat(this.parseArg(args[0])) || 0 : 1;
        const process = useSession.api.getProcess(meta.processKey);
        try {
          await new Promise<void>((resolve, reject) => {
            process.resume = resolve;
            process.cleanups.push(reject);
            setTimeout(resolve, 1000 * seconds);
          });
          // Perhaps only need to handle suspension?
          await handleProcessStatus(meta.processKey);
        } catch (e) {
          throw null;
        }
        break;
      }
      case 'split': {
        const arg = this.parseArg(args[0]);
        yield* arg === undefined
          ? this.split(node)
          : this.splitBy(node, arg);
        break;
      }
      case 'sponge': {
        const outputs = [] as any[];
        yield* this.read(node, (data: any[]) => { outputs.push(data); });
        yield outputs;
        break;
      }
      case 'wall': {
        const { opts } = getOpts(args, { boolean: [
          'c', // cut out wall
        ], });
        const outputs = [] as any[];
        yield* this.read(node, (data: any[]) => { outputs.push(data); });
        const filtered = outputs.filter(x => x.length === 4 && x.every(Number.isFinite));
        useStage.api.addWalls(meta.sessionKey, filtered, {
          cutOut: opts.c,
        });
        break;
      }
      default: throw testNever(command);
    }
  }

  async invokeFunc(node: Sh.CallExpr, namedFunc: NamedFunction, args: string[]) {
    /**
     * TODO shouldn't set positionals in global variable scope.
     * Each invokation of a function is given a processKey, so let's relativize.
     */
    const { var: v, ttyShell } = useSession.api.getSession(node.meta.sessionKey);
    args.forEach((arg, i) => v[i + 1] = arg);
    Object.assign(namedFunc.node.meta, { ...node.meta, processKey: shortid.generate() });
    await ttyShell.spawn(namedFunc.node);
  }
}

export const cmdService = new CmdService;
