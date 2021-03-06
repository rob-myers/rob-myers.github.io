import { testNever } from "@model/generic.model";
import type * as Sh from "./parse.model";
import { geomService } from "@model/geom/geom.service";
import { Process } from "@store/shell.store";
import { processService as ps} from './process.service';
import { ShError, breakError, continueError } from "./semantics.service";
import { varService, alphaNumericRegex, iteratorDelayVarName } from "./var.service";
import { voiceDevice } from "./voice.device";
import { getOpts, hasAncestralIterator } from "./parse.util";

export class BuiltinService {

  isBuiltinCommand(command: string): command is BuiltinKey {
    return !!(builtins as Record<string, boolean>)[command];
  }

  /** `command` may also be any string starting with `@` */
  async runBuiltin(node: Sh.CallExpr, command: BuiltinKey, args: string[]) {

    // Wrap in a promise so Ctrl-C can reject via process.cleanups
    await new Promise(async (resolve, reject) => {
      const process = ps.getProcess(node.meta.pid);
      const removeCleanup = ps.addCleanup(process.pid, () => reject(null));
      node.exitCode = 0;

      try {
        switch (command) {
          case 'break': this.break(node, args); break;
          case 'call': await this.call(process, args); break;
          case 'click': await this.click(process, args); break;
          case 'continue': this.continue(node, args); break;
          case 'def': await this.def(process, args); break;
          case 'delay': this.delay(process, args); break;
          case 'echo': await this.echo(process, args); break;
          case 'false': node.exitCode = 1; break;
          case 'get': this.get(process, args); break;
          case 'kill': this.kill(process, node, args); break;
          case 'ps': await this.ps(process, args); break;
          case 'read': await this.read(process, args); break;
          case 'say': await this.say(process, args); break;
          case 'sleep': await this.sleep(process, args); break;
          case 'true': break;
          default: throw testNever(command);
        }

        removeCleanup();
        resolve();
      } catch (e) {// Must forward errors thrown by builtins
        e && (e.message = `${command}: ${e.message}`);
        reject(e);
      }
    });
  }

  private break(node: Sh.CallExpr, args: string[]) {
    const loopCount = args.length ? Number(args[0]) : 1;

    if (args.length > 1 || !Number.isInteger(loopCount) || loopCount <= 0) {
      throw new ShError(`usage \`break\` or \`break n\` where n > 0`, 1);
    } else if (!hasAncestralIterator(node)) {
      throw new ShError(`only meaningful in a \`for', \`while' or \`until' loop`, 1);
    }
    throw breakError(loopCount);
  }

  private async click({ sessionKey, pid, fdToOpen }: Process, args: string[]) {
    const { worldDevice } = ps.getSession(sessionKey);
    let stopListening: () => void;

    try {
      await new Promise((resolve, reject) => {
        stopListening = worldDevice.read((msg) => {
          // if (msg.key === 'nav-click') {
          //   if (args.length) {
          //     varService.assignVar(pid, { varName: args.shift()!, value: msg });
          //     !args.length && resolve();
          //   } else {// Originally no args
          //     fdToOpen[1].write(msg);
          //     resolve();
          //   }
          // }
        }, false);
        ps.addCleanup(pid, () => reject(null));
      });
    } finally {
      stopListening!();
    }
  }

  private continue(node: Sh.CallExpr, args: string[]) {
    const loopCount = args.length ? Number(args[0]) : 1;

    if (args.length > 1 || !Number.isInteger(loopCount) || loopCount <= 0) {
      throw new ShError(`usage \`continue\` or \`continue n\` where n > 0`, 1);
    } else if (!hasAncestralIterator(node)) {
      throw new ShError('only meaningful in a `for\', `while\' or `until\' loop', 1);
    }
    throw continueError(loopCount);
  }

  private async def({ pid }: Process, [funcName, funcDef, ...rest]: string[]) {
    if (!funcName || !funcDef || rest.length) {
      throw new ShError('usage `def my_func \'(v) => v.foo = Math.random()`', 1);
    }
    varService.addFunction(pid, funcName, {
      type: 'js',
      func: Function('v', `return ${funcDef}`) as () => (x: Record<string, any>) => void,
    });
  }

  private async call({ pid }: Process, [funcDef, ...rest]: string[]) {
    if (!funcDef) {
      throw new ShError('usage `do \'(scope, args) => ... \' [args]`', 1);
    }
    const func = Function('v', `return ${funcDef}`); // TODO cache
    const result = await func()(varService.createVarProxy(pid), rest);
    if (result !== undefined) {
      ps.getProcess(pid).fdToOpen[1].write(result);
    }
  }

  private delay({ pid }: Process, args: string[]) {
    const permitted = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 1];
    if (args.length !== 1 || !permitted.includes(Number(args[0]))) {
      throw new ShError(`usage \`delay t where t in {${permitted}}\``, 1);
    }

    varService.assignVar(pid, {
      varName: iteratorDelayVarName,
      value: Number(args[0]),
      internal: true,
    });
  }

  /** Writes arguments, which includes any options. */
  private async echo({ fdToOpen }: Process, args: string[]) {
    fdToOpen[1].write(args.join(' '));
  }

  /**
   * Deep var lookup which outputs to stdout.
   */
  private get({ pid, fdToOpen }: Process, [srcPath, ...rest]: string[]) {
    if (!srcPath || rest.length) {
      throw new ShError('usage `get foo` or `get foo.bar[2]`', 1);
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
        fdToOpen[1].write(value);
      }
    } catch (e) {
      throw new ShError(`path ${srcPath} not found`, 1);
    }
  }

  private async kill({ pid }: Process, node: Sh.CallExpr, args: string[]) {
    for (const arg of args) {
      try {
        ps.cleanup(Number(arg));
      } catch {
        ps.warn(pid, `kill: ${arg}: unknown pid`);
        node.exitCode = 1;
      }
    }
  }
 
  private parsePointArg(pid: number, varOrJson: string) {
    if (varOrJson.startsWith('{')) {
      return geomService.tryParsePoint(varOrJson);
    }
    const value = varService.lookupVar(pid, varOrJson);
    if (geomService.isVectorJson(value)) {
      return value;
    }
    throw new ShError(`${varOrJson}: expected point-valued variable`, 1);
  }

  private parsePointOrPathArg(pid: number, varOrJson: string) {
    if (varOrJson.startsWith('{')) {
      return geomService.tryParsePoint(varOrJson);
    } else if (varOrJson.startsWith('[')) {
      return geomService.tryParsePath(varOrJson);
    }
    const value = varService.lookupVar(pid, varOrJson);
    if (geomService.isVectorJson(value)) {
      return value;
    } else if (geomService.isVectorJsonPath(value)) {
      return value;
    }
    throw new ShError(`${varOrJson}: expected point/path/variable`, 1);
  }

  private async ps({ sessionKey, fdToOpen }: Process, args: string[]) {
    if (args.length) {
      throw new ShError('arguments are unsupported', 1);
    }
    fdToOpen[1].write('PID'.padEnd(7) + 'PPID'.padEnd(9) + 'CMD');
    const metas = ps.getProcessesMeta(sessionKey);
    for (const { pid, ppid, command } of metas) {
      fdToOpen[1].write(`${pid}`.padEnd(7) + `${ppid}`.padEnd(9) + `${command}`);
    }
  }

  private async read({ pid, sessionKey, fdToOpen, cleanups }: Process, args: string[]) {
    if (args.some(arg => !alphaNumericRegex.test(arg))) {
      throw new ShError('usage `read [var_names]`', 1);
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
          throw new ShError(`background process tried reading from tty`, 1);
        }
        ps.readOnceFromTty(sessionKey, onWrite);
      } else {
        cleanups.push(fdToOpen[0].onWrite(onWrite, true));
      }
      cleanups.push(() => reject(null));
    });
  }

  private async runAndHandleError(promiseFactory: () => Promise<null | string>) {
    const error = await promiseFactory();
    if (error) {
      throw new ShError(error, 1);
    }
  }
  
  private async say({ fdToOpen, cleanups }: Process, args: string[]) {
    const { _: operands, voice, v } = getOpts(args, { string: ['voice', 'v'] });

    if (voice || v === '?') {// List available voices
      return voiceDevice.getAllVoices().forEach(voice => fdToOpen[1].write(voice));
    }
    await new Promise(async (resolve, reject) => {
      cleanups.push(
        voiceDevice.addVoiceCommand(operands.join(' '), resolve, voice || v),
        () => reject(null),
      );
    });
  }

  /**
   * Wait for sum of arguments in seconds.
   * - if there are no arguments we'll sleep for 1 second.
   * - if the sum is negative we'll wait 0 seconds.
   */
  private async sleep({ pid }: Process, args: string[]) {
    // const { _: operands, __optKeys } = parseSh.getOpts(args, {});
    let seconds = args.length ? 0 : 1, delta: number;
    
    for (const arg of args) {
      seconds += (delta = Number(arg));
      if (Number.isNaN(delta)) {
        throw new ShError(`invalid time interval ‘${arg}’`, 1);
      }
    }
    await ps.sleep(pid, 1000 * seconds);
  }

}

export const builtins = {
  /** Exit for, while or until */
  break: true,
  /** Immediately invoke a javascript function */
  call: true,
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
  /** Kill pids */
  kill: true,
  /** List running processes */
  ps: true,
  /** Read from stdin and store in provided variable */
  read: true,
  /** Say args */
  say: true,
  /** Wait for sum of arguments in seconds */
  sleep: true,
  /** Set delays of subsequent iterator iterations */
  delay: true,
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
