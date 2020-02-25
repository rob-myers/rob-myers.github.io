import { BuiltinOtherType } from '../builtin.model';
import { BaseDeclareComposite } from './base-declare';
import { ObservedType } from '@service/term.service';
import { ProcVarDisplayOpt, ProcVarPredicate, procVarPredicates, printVar } from '@service/process-var.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osGetVarsThunk, osGetFunctionsThunk, osGetFunctionThunk, BaseAssignOpts, osUpdateFunctionAct } from '@store/os/declare.os.duck';
import { NamedFunction } from '@model/os/process.model';

export class DeclareOrTypesetBuiltin<
  Key extends BuiltinOtherType.declare | BuiltinOtherType.typeset
> extends BaseDeclareComposite<Key> {

  public specOpts() {
    return { string: [], boolean: [] };
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {

    yield* this.computeOpts(dispatch, processKey);
    /**
     * Display information iff:
     * no variable names specified, or
     * restricted to function names only (-F), or
     * restricted to display attributes and value of each NAME (-p).
     */
    const displayOnly = !this.def.assigns.length
      || this.isOptSet[ProcVarDisplayOpt.F]
      || this.isOptSet[ProcVarDisplayOpt.p];

    if (displayOnly) {
      const buffer = [] as string[];
      /**
       * Should we restrict to exported variables?
       */
      const exported = this.isOptSet[ProcVarPredicate.x] || false;

      if (
        this.isOptSet.p
        && (this.isOptSet[ProcVarDisplayOpt.F] || this.isOptSet[ProcVarDisplayOpt.f] )
      ) {
        /**
         * Ignore empty case.
         */
        return;
      } else if (
        !this.isOptSet[ProcVarDisplayOpt.p]
        && !this.isOptSet[ProcVarDisplayOpt.F]
        && !this.isOptSet[ProcVarDisplayOpt.f]
      ) {
        const allVars = dispatch(osGetVarsThunk({ processKey }));
        const allFuncs = dispatch(osGetFunctionsThunk({ processKey }));
        /**
         * Are we setting any attribute?
         */
        const setAttrib = procVarPredicates.some((x) => this.isOptSet[x] === true);

        if (setAttrib) {
          /**
           * Restrict to variables matching at least one specified option.
           */
          const vars = this.restrictVars(allVars, { matches: this.specifiedPreds });
          buffer.push(...this.printVars(vars));
        } else {
          /**
           * Show all variables with no filtering.
           */
          const vars = this.restrictVars(allVars, {});
          buffer.push(...vars.map((v) => `${v.varName}=${printVar(v)}`));
          /**
           * Show all functions with no filtering.
           */
          buffer.push(...this.printFuncs(allFuncs, { kind: 'full' }));
        }
      } else if (this.isOptSet.p) {// Vars only.
        /**
         * Show all variables, possibly filtered by variable names AND options.
         * Format: declare -{opts or -} {var}="{value}"
         */
        const allVars = dispatch(osGetVarsThunk({ processKey }));
        const vars = this.restrictVars(allVars, { matches: this.specifiedPreds, varNames: this.varNames});
        buffer.push(...this.printVars(vars));

      } else if (this.isOptSet.F) {// Function names only.
        /**
         * Show all function names, possibly filtered by variable names and exported.
         */
        const allFuncs = dispatch(osGetFunctionsThunk({ processKey }));
        buffer.push(...this.printFuncs(allFuncs, { exported, kind: 'header', varNames: this.varNames }));
      } else if (this.isOptSet.f) {// Functions only.
        /**
         * Show all functions, possibly filtered by variable names and export-option.
         */
        const allFuncs = dispatch(osGetFunctionsThunk({ processKey }));
        buffer.push(...this.printFuncs(allFuncs, { exported, kind: 'full', varNames: this.varNames }));
      }

      yield this.write(buffer);
    }

    /**
     * Otherwise set attributes.
     */
    if (this.isOptSet[ProcVarDisplayOpt.f]) {
      /**
       * Modify properties of functions.
       * Declaration of functions is handled by {FunctionComposite}.
       */
      for (const functionName of this.varNames) {
        const updates = {} as  Partial<NamedFunction>;
        
        if (ProcVarPredicate.r in this.isOptSet) {
          /**
           * -r or +r specified.
           */
          const func = dispatch(osGetFunctionThunk({ processKey, functionName }));
          if (func && func.readonly && !this.isOptSet[ProcVarPredicate.r]) {
            yield this.warn(`${functionName}: readonly function`);
            continue;
          }
          updates.readonly = this.isOptSet[ProcVarPredicate.r];
        }
        if (ProcVarPredicate.x in this.isOptSet) {
          /**
           * -x or +x specified.
           */
          updates.readonly = this.isOptSet[ProcVarPredicate.x];
        }
        dispatch(osUpdateFunctionAct({ processKey, functionName, updates }));
      }
    } else {// Modify/assign variables.
      
      /**
       * Mutate {def.assigns} appropriately.
       * {AssignComposite} forwards them to {osAssignVarThunk}.
       * Only set if appear in {isOptSet}.
       */
      const declOpts: Partial<BaseAssignOpts> = {};
      (ProcVarPredicate.a in this.isOptSet) && (declOpts.array = this.isOptSet[ProcVarPredicate.a]);
      (ProcVarPredicate.A in this.isOptSet) && (declOpts.associative = this.isOptSet[ProcVarPredicate.A]);
      (ProcVarPredicate.x in this.isOptSet) && (declOpts.exported = this.isOptSet[ProcVarPredicate.x]);
      (ProcVarPredicate.i in this.isOptSet) && (declOpts.integer = this.isOptSet[ProcVarPredicate.i]);
      (ProcVarPredicate.l in this.isOptSet) && (declOpts.lower = this.isOptSet[ProcVarPredicate.l]);
      (ProcVarPredicate.r in this.isOptSet) && (declOpts.readonly = this.isOptSet[ProcVarPredicate.r]);
      (ProcVarPredicate.u in this.isOptSet) && (declOpts.upper = this.isOptSet[ProcVarPredicate.u]);
      this.def.assigns.forEach((assign) => assign.declOpts = { ...declOpts });

      for (const assign of this.def.assigns) {
        // `declare -aA foo` errors without exiting.
        if (this.isOptSet[ProcVarPredicate.a] && this.isOptSet[ProcVarPredicate.A]) {
          yield this.warn(`${assign.def.varName}: cannot convert associative to indexed array`);
          continue;
        }
        // TODO `declare: ` prefix for better errors.
        yield* this.runChild({ child: assign, dispatch, processKey });
      }
    } 
  }

}

export class DeclareBuiltin extends DeclareOrTypesetBuiltin<BuiltinOtherType.declare> {}
