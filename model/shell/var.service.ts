import { testNever } from "@model/generic.model";
import useStore, { State as ShellState } from '@store/shell.store';
import { ProcessVar } from "./var.model";

export class VarService {
  private set!: ShellState['api']['set'];

  initialise() {
    this.set = useStore.getState().api.set;
  }

  cloneVar(input: ProcessVar): ProcessVar {
    switch (input.key) {
      case 'integer': 
      case 'positional':
      case 'string':
      case 'unset': {
        return { ...input };
      }
      case 'string[]': return { ...input, value: input.value ? input.value.slice() : null };
      case 'integer[]': return { ...input, value: input.value ? input.value.slice() : null };
      case 'to-string': return { ...input, value: input.value ? { ...input.value } : null };
      case 'to-integer': return { ...input, value: input.value ? { ...input.value } : null };
      default: throw testNever(input);
    }
  }

}

export const varService = new VarService;
