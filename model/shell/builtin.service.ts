import { testNever, pause } from "@model/generic.model";
import { Process } from "@store/shell.store";
import * as Sh from "./parse.service";
import { processService as ps, processService} from './process.service';
import { ShError } from "./transpile.service";

export class BuiltinService {

  isBuiltinCommand(command: string): command is BuiltinKey {
    return !!(builtins as Record<string, boolean>)[command];
  }

  async runBuiltin(node: Sh.CallExpr, command: BuiltinKey, args: string[]) {
    const process = ps.getProcess(node.meta.pid);
    switch (command) {
      case 'click': await this.click(process, args); break;
      case 'echo': await this.echo(process, args); break;
      case 'sleep': await this.sleep(args); break;
      default: throw testNever(command);
    }
  }

  /**
   * TODO 
   * - only listen for clicks; use typings
   * - ensure fdToOpen reference not stale
   */
  private async click({ sessionKey, fdToOpen }: Process, _args: string[]) {
    const { worldDevice, cancels } = processService.getSession(sessionKey);
    await new Promise((resolve) => {
      const stopListening = worldDevice.listen((msg) => {
        fdToOpen[1].write(msg);
        stopListening();
        resolve();
      });
      cancels.push(stopListening);
    });
  }

  /** Writes arguments, which includes any options  */
  private async echo({ fdToOpen }: Process, args: string[]) {
    fdToOpen[1].write(args.join(' '));
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


/**
 * TODO
 */
export const builtins = {
  click: true,
  echo: true,
  sleep: true,
};

export type BuiltinKey = keyof typeof builtins;

export const builtinService = new BuiltinService;
