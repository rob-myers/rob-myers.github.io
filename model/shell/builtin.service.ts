import { testNever, pause } from "@model/generic.model";
import { Process } from "@store/shell.store";
import * as Sh from "./parse.service";
import { parseService } from "./parse.service";
import { processService as ps} from './process.service';
import { ShError, breakError, continueError } from "./transpile.service";
import { varService, alphaNumericRegex } from "./var.service";

export class BuiltinService {

  isBuiltinCommand(command: string): command is BuiltinKey {
    return !!(builtins as Record<string, boolean>)[command];
  }

  async runBuiltin(node: Sh.CallExpr, command: BuiltinKey, args: string[]) {
    // Wrap in a promise so Ctrl-C can reject via process.cleanups
    await new Promise(async (resolve, reject) => {
      const process = ps.getProcess(node.meta.pid);
      const removeCleanup = ps.addCleanups(process.pid, () => reject(null));
      node.exitCode = 0;
      try {
        switch (command) {
          case 'break': this.break(node, args); break;
          case 'click': await this.click(process, args); break;
          case 'continue': this.continue(node, args); break;
          case 'def': await this.def(process, args); break;
          case 'echo': await this.echo(process, args); break;
          case 'false': node.exitCode = 1; break;
          case 'get': this.get(process, args); break;
          case 'read': await this.read(process, args); break;
          case 'sleep': await this.sleep(args); break;
          case 'true': break;
          default: throw testNever(command);
        }
        removeCleanup();
        resolve();
      } catch (e) {// Must forward errors thrown by builtins
        if (e instanceof ShError) {
          e.message = `${command}: ${e.message}` 
        }
        reject(e);
      }
    });
  }

  private break(node: Sh.CallExpr, args: string[]) {
    const loopCount = args.length ? Number(args[0]) : 1;

    if (args.length > 1 || !Number.isInteger(loopCount) || loopCount <= 0) {
      throw new ShError(`usage \`break\` or \`break n\` where n > 0`, 1);
    } else if (!parseService.hasAncestralIterator(node)) {
      throw new ShError(`only meaningful in a \`for', \`while' or \`until' loop`, 1);
    }
    throw breakError(loopCount);
  }

  private async click({ sessionKey, pid, fdToOpen, cleanups }: Process, args: string[]) {
    if (args.length > 1) {
      throw new ShError(`usage \`click\` or \`click evt\``, 1);
    }

    await new Promise((resolve, reject) => {
      const { worldDevice } = ps.getSession(sessionKey);
      ps.addCleanups(pid, () => reject(null),
        worldDevice.read((msg) => {
          if (msg.key === 'navmesh-click') {
            if (args.length) {
              varService.assignVar(pid, { varName: args[0], value: msg });
            } else {
              fdToOpen[1].write(msg);
            }
            resolve();
          }
        }, true),
      );
    });
  }

  private continue(node: Sh.CallExpr, args: string[]) {
    const loopCount = args.length ? Number(args[0]) : 1;

    if (args.length > 1 || !Number.isInteger(loopCount) || loopCount <= 0) {
      throw new ShError(`usage \`continue\` or \`continue n\` where n > 0`, 1);
    } else if (!parseService.hasAncestralIterator(node)) {
      throw new ShError(`only meaningful in a \`for', \`while' or \`until' loop`, 1);
    }
    throw continueError(loopCount);
  }

  private async def({ pid }: Process, [funcName, funcDef, ...rest]: string[]) {
    if (!funcName || !funcDef || rest.length) {
      throw new ShError(`usage \`def myFunc '(x) => x.foo = Number(x[1])''\``, 1);
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
    fdToOpen[1].write(args.join(' '));
  }

  /**
   * Deep var lookup, either output to stdout or can save as variable.
   */
  private get({ pid, fdToOpen }: Process, [srcPath, ...rest]: string[]) {
    if (rest.length && (rest[0] !== 'as' || rest.length !== 2)) {
      throw new ShError(`usage \`get foo\` or \`get foo as bar\``, 1);
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
    if (rootVar === undefined) {
      throw new ShError(`${cached.varName} not found`, 1);
    }

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
      throw new ShError(`path ${srcPath} not found`, 1);
    }
  }

  private async read({ pid, sessionKey, fdToOpen, cleanups }: Process, args: string[]) {
    if (args.some(arg => !alphaNumericRegex.test(arg))) {
      throw new ShError(`usage \`read\` or \`read x\``, 1);
    }

    await new Promise((resolve, reject) => {
      const onWrite = (msg: any) => {
        if (args.length) {
          if (typeof msg === 'string') {// Assign words to variables
            const [words, lastArg] = [msg.trim().replace(/\s\s+/g, ' ').split(' '), args.pop()];
            args.forEach(varName => varService.assignVar(pid, { varName, value: words.shift() || '' }));
            lastArg && varService.assignVar(pid, { varName: lastArg, value: words.join(' ') });
          } else {
            varService.assignVar(pid, { varName: args[0], value: msg });
          }
        }
        resolve();
      };

      if (ps.isTty(pid, 0)) {
        if (!ps.isForegroundProcess(pid)) {
          throw new ShError(`background process tried to read from tty`, 1);
        }
        ps.readOnceFromTty(sessionKey, onWrite);
      } else {
        cleanups.push(fdToOpen[0].onWrite(onWrite, true));
      }
      cleanups.push(() => reject(null));
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
        throw new ShError(`invalid time interval ‘${arg}’`, 1);
      }
    }
    await pause(1000 * seconds);
  }
}

export const builtins = {
  /** Exit for, while or until */
  break: true,
  /** Write next navmesh click to stdout */
  click: true,
  /** Continue for, while or until */
  continue: true,
  /** Define a shell function using javascript */
  def: true,
  /** Write shell expansion to stdout */
  echo: true,
  /** Exit with code 1 */
  false: true,
  /** Write a js variable's value to stdout */
  get: true,
  /** Read from stdin and store in provided variable */
  read: true,
  /** Wait for sum of arguments in seconds */
  sleep: true,
  /** Exit with code 0 */
  true: true,
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
