import { catchError } from 'rxjs/operators';

import { testNever, pause } from "@model/generic.model";
import { Process } from "@store/shell.store";
import { awaitEnd } from "./rxjs.model";
import { BuiltinKey, builtins } from "./process.model";
import * as Sh from "./parse.service";
import { parseSh } from './parse.service';
import { processService as ps} from './process.service';
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
      case 'echo': await this.echo(process, args); break;
      case 'sleep': await this.sleep(args); break;
      default: throw testNever(command);
    }

    if (Redirs.length) {
      ps.popRedirectScope(process.pid);
    }
  }

  /** Writes arguments, which includes any options  */
  private async echo({ fdToOpen }: Process, args: string[]) {
    fdToOpen[1].write(args.join(' '));
  }

  /**
   * Wait for sum of arguments in seconds.
   * If there are no arguments we'll sleep for 1 second.
   * If the sum is negative we'll wait 0 seconds.
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

    await pause(seconds * 1000);
  }
}

export const builtinService = new BuiltinService;
