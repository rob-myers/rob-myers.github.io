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
    // Wrap in a promise so Ctrl-C can reject via process.cleanups
    await new Promise(async (resolve, reject) => {
      const process = ps.getProcess(node.meta.pid);
      process.cleanups.push(() => reject(null));
      node.exitCode = 0;
      try {
        switch (command) {
          case 'click': await this.click(process, args); break;
          case 'def': await this.def(process, args); break;
          case 'echo': await this.echo(process, args); break;
          case 'get': this.get(process, args); break;
          case 'read': await this.read(process, args); break;
          case 'sleep': await this.sleep(args); break;
          default: throw testNever(command);
        }
      } catch (e) {// Must forward errors thrown by builtins
        reject(e);
      }
      resolve();
    });
  }

  private async click({ sessionKey, pid, fdToOpen, cleanups }: Process, args: string[]) {
    if (args.length > 1) {
      throw new ShError(`click: usage \`click\` or \`click evt\``, 1);
    }

    const { worldDevice } = ps.getSession(sessionKey);
    await new Promise((resolve, reject) => {
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
      cleanups.push(() => reject(null), stopListening);
    });
  }

  private async def({ pid }: Process, [funcName, funcDef, ...rest]: string[]) {
    if (!funcName || !funcDef || rest.length) {
      throw new ShError(`def: usage \`def myFunc '(x) => x.foo = Number(x[1])''\``, 1);
    }
    varService.addFunction(pid, funcName, {
      type: 'js',
      func: Function('v', `return ${funcDef}`) as () => (x: Record<string, any>) => void,
    });
  }

  /**
   * Writes arguments, which includes any options.
   */
  private async echo({ fdToOpen }: Process, args: string[]) {
    // console.log({ echoOfd: fdToOpen[1] })
    fdToOpen[1].write(args.join(' '));
  }

  /**
   * Deep var lookup, either output to stdout or can save as variable.
   */
  private get({ pid, fdToOpen }: Process, [srcPath, ...rest]: string[]) {
    if (rest.length && (rest[0] !== 'as' || rest.length !== 2)) {
      throw new ShError(`get: usage \`get foo\` or \`get foo as bar\``, 1);
    }

    let cached = cacheFor.get[srcPath];
    if (!cached) {
      const varName = srcPath.split(/[\.\[]/, 1)[0];
      const relJsPath = srcPath.slice(varName.length);
      cached = (cacheFor.get[srcPath] = { varName, relJsPath: relJsPath,
        // Works because user vars may not start with underscore
        func: Function('__', `return __${relJsPath};`) as (x: any) => any,
      });
    }

    const rootVar = varService.lookupVar(pid, cached.varName);
    if (rootVar !== undefined) {
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
   * TODO
   * - if reading from a tty then override it for one line.
   * - but if process running in background throw error.
   */
  private async read({ pid, fdToOpen, cleanups }: Process, args: string[]) {
    if (args.length > 1) {
      throw new ShError(`read: usage \`read\` or \`read x\``, 1);
    }

    await new Promise((resolve, reject) => {
      const stopReading = fdToOpen[0].onWrite((msg) => {
        if (args.length) {
          varService.assignVar(pid, { varName: args[0], value: msg });
        } else {
          fdToOpen[1].write(msg);
        }
        stopReading();
        resolve();
      });
      cleanups.push(() => reject(null), stopReading);
    });
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
  def: true,
  echo: true,
  get: true,
  read: true,
  sleep: true,
};

export type BuiltinKey = keyof typeof builtins;

export const builtinService = new BuiltinService;

const cacheFor = {
  /** Keyed by `${varName}${relJsPath}` */
  get: {} as Record<string, {
    /** Root variable name */
    varName: string;
    /** Path/code inside variable e.g. empty, `.foo`, `[0].bar`, `.map(Number) */
    relJsPath: string;
    func: (rootVar: any) => any;
  }>,
};
