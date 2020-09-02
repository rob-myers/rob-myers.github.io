import { BuiltinKey, builtins } from "./process.model";

export class BuiltinService {

  isBuiltinCommand(command: string): command is BuiltinKey {
    return !!(builtins as Record<string, boolean>)[command];
  }

  async runBuiltin(command: BuiltinKey) {
    /**
     * TODO
     */
    console.log(`TODO run builtin ${command}`);
  }
}

export const builtinService = new BuiltinService;
