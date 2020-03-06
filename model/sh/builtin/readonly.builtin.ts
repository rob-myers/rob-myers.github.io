import { BuiltinSpecialType } from '../builtin.model';
import { BaseDeclareComposite } from './base-declare';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { ProcVarPredicate, ProcVarDisplayOpt } from '@model/os/service/process-var.service';
import { osGetVarsThunk, osGetFunctionsThunk, osUpdateFunctionAct } from '@store/os/declare.os.duck';

export class ReadonlyBuiltin extends BaseDeclareComposite<BuiltinSpecialType.readonly> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    yield* this.computeOpts(dispatch, processKey); // Must yield this first.
    
    const numRestricts = [
      ProcVarPredicate.a,
      ProcVarPredicate.A,
      ProcVarDisplayOpt.f,
    ].reduce((agg, item) => agg + Number(this.isOptSet[item] || 0), 0);

    if (numRestricts > 1) {// Empty intersection, so do nothing.
      yield this.exit();
    }

    const buffer = [] as string[];
    const displayOnly = this.isOptSet[ProcVarDisplayOpt.p] && !this.varNames.length;

    if (displayOnly) {
      if (this.isOptSet[ProcVarPredicate.a]) {
        const vars = this.restrictVars(
          dispatch(osGetVarsThunk({ processKey })),
          { matches: [ProcVarPredicate.x, ProcVarPredicate.a], matchAll: true },
        );
        buffer.push(...this.printVars(vars));
      } else if (this.isOptSet[ProcVarPredicate.A]) {
        const vars = this.restrictVars(
          dispatch(osGetVarsThunk({ processKey })),
          { matches: [ProcVarPredicate.x, ProcVarPredicate.A], matchAll: true },
        );
        buffer.push(...this.printVars(vars));
      } else if (this.isOptSet[ProcVarDisplayOpt.f]) {
        const funcs = dispatch(osGetFunctionsThunk({ processKey })).filter(({ readonly }) => readonly);
        buffer.push(...this.printFuncs(funcs, { exported: false, kind: 'full', varNames: [] }));
      }
      // Write buffer to stdout
      yield this.write(buffer, 1);
      yield this.exit();
    }

    // Otherwise, set attributes
    if (this.isOptSet[ProcVarDisplayOpt.f]) {// Modify functions.
      for (const functionName of this.varNames) {
        dispatch(osUpdateFunctionAct({ processKey, functionName, updates: { readonly: true } }));
      }
    } else {
      // Modify and/or assign variables.
      for (const assign of this.def.assigns) {
        assign.declOpts = { readonly: true };
        yield* this.runChild({ child: assign, dispatch, processKey });
      }
    }

    yield this.exit();
  }

}
