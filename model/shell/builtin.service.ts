import { testNever, pause } from "@model/generic.model";
import { Process } from "@store/shell.store";
import * as Sh from "./parse.service";
import { processService as ps} from './process.service';
import { ShError } from "./transpile.service";
import { varService } from "./var.service";

export class BuiltinService {

  isBuiltinCommand(command: string): command is BuiltinKey {
    return !!(builtins as Record<string, boolean>)[command];
  }

  async runBuiltin(node: Sh.CallExpr, command: BuiltinKey, args: string[]) {
    const process = ps.getProcess(node.meta.pid);
    node.exitCode = 0;
    switch (command) {
      case 'click': await this.click(process, args); break;
      case 'echo': await this.echo(process, args); break;
      case 'get': this.get(process, args); break;
      case 'sleep': await this.sleep(args); break;
      default: throw testNever(command);
    }
  }

  private async click({ sessionKey, pid, fdToOpen, cleanups }: Process, args: string[]) {
    if (args.length > 1) {
      throw new ShError(`click: format \`click\` or \`click evt\``, 1);
    }
    
    const { worldDevice } = ps.getSession(sessionKey);
    await new Promise((resolve) => {
      const stopListening = worldDevice.listen((msg) => {
        if (msg.key === 'navmesh-click') {
          if (args.length) {
            varService.assignVar(pid, { varName: args[0], value: msg });
          } else {
            fdToOpen[1].write(msg);
          }
          stopListening();
          resolve();
        }
      });
      cleanups.push(stopListening);
    });
  }

  /**
   * Writes arguments, which includes any options.
   */
  private async echo({ fdToOpen }: Process, args: string[]) {
    fdToOpen[1].write(args.join(' '));
  }

  /**
   * Deep var lookup, either output to stdout or can save as variable.
   */
  private get({ pid, fdToOpen }: Process, [srcPath, ...rest]: string[]) {
    if (rest.length && (rest[0] !== 'as' || rest.length !== 2)) {
      throw new ShError(`get: format \`get foo\` or \`get foo as bar\``, 1);
    }

    let cached = getCmdCache[srcPath];
    if (!cached) {
      const varName = srcPath.split(/[\.\[]/, 1)[0];
      const relPath = srcPath.slice(varName.length);
      cached = (getCmdCache[srcPath] = { varName, relPath,
        func: Function('_v', `return _v${relPath};`) as (x: any) => any,
      });
    }

    const rootVar = varService.lookupVar(pid, cached.varName);
    if (rootVar) {
      try {
        const value = cached.func(rootVar);
        if (value !== undefined) {
          if (rest.length) {
            varService.assignVar(pid, { varName: rest[1], value });
          } else {
            fdToOpen[1].write(value);
          }
        }
      } catch (e) {
        throw new ShError(`get: path ${srcPath} not found`, 1);
      }
    } else {
      throw new ShError(`get: ${cached.varName} not found`, 1);
    }
  }

  /**
   * Wait for sum of arguments in seconds.
   * - if there are no arguments we'll sleep for 1 second.
   * - if the sum is negative we'll wait 0 seconds.
   */
  private async sleep(args: string[]) {
    // const { _: operands, __optKeys } = parseSh.getOpts(args, {});
    let seconds = args.length ? 0 : 1, delta: number;
    
    for (const arg of args) {
      seconds += (delta = Number(arg));
      if (Number.isNaN(delta)) {
        throw new ShError(`sleep: invalid time interval ‘${arg}’`, 1);
      }
    }
    await pause(1000 * seconds);
  }
}

export const builtins = {
  click: true,
  echo: true,
  get: true,
  sleep: true,
};

export type BuiltinKey = keyof typeof builtins;

export const builtinService = new BuiltinService;

const getCmdCache = {} as Record<string, {
  /** Root variable name */
  varName: string;
  /** Path inside variable e.g. empty, `.foo`, `[0].bar` */
  relPath: string;
  func: (rootVar: any) => any;
}>;
