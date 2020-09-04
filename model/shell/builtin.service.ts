import { Process } from "@store/shell.store";
import { awaitEnd } from "./rxjs.model";
import * as Sh from "./parse.service";
import { BuiltinKey, builtins } from "./process.model";
import { processService as ps} from './process.service';
import { CommandCtxt } from "./transpile.service";
import { catchError } from 'rxjs/operators';

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
      case 'echo':
        await this.echo(process, args);
        break;
      default:
        console.log(`TODO run builtin ${command}`);
    }

    if (Redirs.length) {
      ps.popRedirectScope(process.pid);
    }
  }

  private async echo({ fdToOpen }: Process, args: string[]) {
    fdToOpen[1].write(args.join(' '));
  }
}

export const builtinService = new BuiltinService;
