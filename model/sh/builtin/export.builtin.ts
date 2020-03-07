import { BuiltinSpecialType } from '../builtin.model';
import { BaseDeclareComposite } from './base-declare';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osGetVarsThunk, osGetFunctionsThunk, osUpdateFunctionAct } from '@store/os/declare.os.duck';
import { ProcVarDisplayOpt, ProcVarPredicate, ProcVarExtraOpt } from '@model/os/service/process-var.service';

export class ExportBuiltin extends BaseDeclareComposite<BuiltinSpecialType.export> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    yield* this.computeOpts(dispatch, processKey); // Must yield this first
    
    const funcs = dispatch(osGetFunctionsThunk({ processKey }));
    const buffer = [] as string[];
    const displayOnly = this.isOptSet[ProcVarDisplayOpt.p] && !this.varNames.length;

    if (displayOnly) {// Display functions
      buffer.push(...this.printFuncs(funcs, { exported: true, kind: 'full', varNames: this.varNames }));

      if (!this.isOptSet[ProcVarDisplayOpt.f]) {// Display vars too
        const allVars = dispatch(osGetVarsThunk({ processKey }));
        const exportedVars = this.restrictVars(allVars, { matches: [ProcVarPredicate.x]});
        buffer.push(...this.printVars(exportedVars));
      }
      yield this.write(buffer, 1);
      return;
    }
    
    /** Export iff not negated. */
    const exported = !this.isOptSet[ProcVarExtraOpt.n];

    if (this.isOptSet[ProcVarDisplayOpt.f]) {// Functions
      for (const functionName of this.varNames) {// No error if function n'exist pas
        dispatch(osUpdateFunctionAct({ processKey, functionName, updates: { exported } }));
      }
    } else {// Variables.
      for (const assign of this.def.assigns) {
        assign.declOpts.exported = exported;// Creates variable if n'exist pas
        yield* this.runChild({ child: assign, dispatch, processKey });
      }
    }

    yield this.exit();
  }

}
