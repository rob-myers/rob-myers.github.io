import { catchError } from 'rxjs/operators';

import { testNever, pause } from "@model/generic.model";
import { Process } from "@store/shell.store";
import { awaitEnd } from "./rxjs.model";
import * as Sh from "./parse.service";
import { processService as ps, processService} from './process.service';
import { CommandCtxt, ShError } from "./transpile.service";

export class BuiltinService {

  isBuiltinCommand(command: string): command is BuiltinKey {
    return !!(builtins as Record<string, boolean>)[command];
  }

  async runBuiltin(
    node: Sh.CallExpr,
    { Redirs }: CommandCtxt,
    command: BuiltinKey,
    args: string[],
  ) {
    const process = ps.getProcess(node.meta.pid);

    if (Redirs.length) {
      ps.pushRedirectScope(process.pid);
      for (const redirect of Redirs) {
        await awaitEnd(redirect.pipe(catchError((e, _src) => {
          ps.popRedirectScope(process.pid);
          throw e;
        })));
      }
    }

    switch (command) {
      case 'click': await this.click(process, args); break;
      case 'echo': await this.echo(process, args); break;
      case 'sleep': await this.sleep(args); break;
      default: throw testNever(command);
    }

    if (Redirs.length) {
      ps.popRedirectScope(process.pid);
    }
  }

  /**
   * TODO 
   * - non-blocking reads
   * - only listen for clicks, use types
   * - ensure fdToOpen reference not stale
   */
  private async click({ sessionKey, fdToOpen }: Process, _args: string[]) {
    const { worldDevice, cancels } = processService.getSession(sessionKey);
    await new Promise((resolve) => {
      const stopReading = worldDevice.read((msg) => {
        fdToOpen[1].write(msg);
        stopReading();
        resolve();
      });
      cancels.push(stopReading);
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
