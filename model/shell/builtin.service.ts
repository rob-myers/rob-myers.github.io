import { Process } from "@store/shell.store";
import { BuiltinKey, builtins } from "./process.model";
import * as Sh from "./parse.service";
import { processService as ps} from './process.service';

export class BuiltinService {

  isBuiltinCommand(command: string): command is BuiltinKey {
    return !!(builtins as Record<string, boolean>)[command];
  }

  /**
   * TODO
   */
  async runBuiltin(node: Sh.CallExpr, command: BuiltinKey, args: string[]) {
    const process = ps.getProcess(node.meta.pid);

    switch (command) {
      case 'echo':
        return this.echo(process, args);
      default:
        console.log(`TODO run builtin ${command}`);
    }
  }

  private async echo(process: Process, args: string[]) {
    process.fdToOpen[1].write(args.join(' '));
  }
}

export const builtinService = new BuiltinService;
