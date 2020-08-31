import { testNever } from "@model/generic.model";
import useStore, { State as ShellState, Process } from '@store/shell.store';
import { ProcessVar, BasePositionalVar } from "./var.model";

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

  getPositionals(pid: number) {
    const { nestedVars } = this.getProcess(pid)
    /**
     * Positionals are in 1st scope containing 0.
     * Such a scope always exists i.e. the last item in `nestedVars`.
     */
    const toVar = nestedVars.find((toVar) => 0 in toVar);
    if (toVar) {// Collect all positions, starting from 0
      let i = -1;
      const positions = [] as number[];
      while (++i in toVar) {
        positions.push(i);
      }
      // console.log({ positions });
      return positions.map((i) => (toVar[i] as BasePositionalVar).value);
    }
    throw Error('positional variables not found in process');    
  }

  private getProcess(pid: number): Process {
    return useStore.getState().proc[pid];
  }

}

export const varService = new VarService;
