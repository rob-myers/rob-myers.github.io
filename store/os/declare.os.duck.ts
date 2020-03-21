/* eslint-disable @typescript-eslint/no-use-before-define */
import { OsAct } from '@model/os/os.model';
import { SyncAct, SyncActDef } from '@model/redux.model';
import { createOsAct, createOsThunk, OsThunkAct } from '@model/os/os.redux.model';
import { ProcessVar, VarFlags, ToProcVar, NamedFunction, BasePositionalVar, PositionalProcVar } from '@model/os/process.model';
import { State } from './os.duck';
import { updateLookup, addToLookup } from '@model/redux.model';
import { mapValues, testNever, last, flatten, withoutProperty } from '@model/generic.model';
import { createPositional, cloneVar } from '@os-service/process-var.service';
import { closeFd } from '@os-service/filesystem.service';
import { osUpdateProcessAct } from './process.os.duck';
import { TermError } from '@os-service/term.util';
import { Term } from '@model/os/term.model';

export type Action = (
  | AddFunctionAct
  | PopRedirectScopeAct
  | PopPositionalsScopeAct
  | PopVarScopeAct
  | PushPositionalsScopeAct
  | PushRedirectScopeAct
  | PushVarScopeAct
  // | RemoveFunctionAct
  // | SetPositionalsAct
  | SetZeroethParamAct
  | ShiftPositionalsAct
  | UpdateFunctionAct
  | UpdateNestedVarAct
);

/**
 * Register function with process.
 */
export const osAddFunctionAct = createOsAct<OsAct, AddFunctionAct>(OsAct.OS_ADD_FUNCTION);
export interface AddFunctionAct extends SyncAct<OsAct, {
  processKey: string;
  funcName: string;
  term: Term;
  src: null | string;
}> {
  type: OsAct.OS_ADD_FUNCTION;
}
export const osAddFunctionDef: SyncActDef<OsAct, AddFunctionAct, State> = ({ funcName, processKey, src, term }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, ({ toFunc }) => ({
    toFunc: addToLookup({ key: funcName, exported: false, readonly: false, src, term }, toFunc),
  })),
});

/**
 * Pop variable scopes up to and including deepest where
 * positionals were set. This action should always be guarded by
 * {pushPositionalScopeAct}, so original scope is never popped.
 */
export const osPopPositionalsScopeAct = createOsAct<OsAct, PopPositionalsScopeAct>(
  OsAct.OS_POP_POSITIONALS_SCOPE,
);
export interface PopPositionalsScopeAct extends SyncAct<OsAct, { processKey: string }> {
  type: OsAct.OS_POP_POSITIONALS_SCOPE;
}
export const osPopPositionalsScopeDef: SyncActDef<OsAct, PopPositionalsScopeAct, State> = ({ processKey }, state) => {
  const { nestedVars } = state.proc[processKey];
  // Index of deepest scope where positionals were set (shouldn't be 0).
  const scopeIndex = nestedVars.findIndex((toVar) => 0 in toVar);
  return { ...state,
    proc: updateLookup(processKey, state.proc, () => ({
      nestedVars: nestedVars.slice(scopeIndex + 1),
    })),
  };
};

/**
 * Remove deepest redirection scope in {processKey}.
 */
export const osPopRedirectScopeAct = createOsAct<OsAct, PopRedirectScopeAct>(
  OsAct.OS_POP_REDIRECT_SCOPE,
);
interface PopRedirectScopeAct extends SyncAct<OsAct, { processKey: string }> {
  type: OsAct.OS_POP_REDIRECT_SCOPE;
}
export const osPopRedirectScopeDef: SyncActDef<OsAct, PopRedirectScopeAct, State> = ({ processKey }, state) => {
  const { nestedRedirs } = state.proc[processKey];
  const [deepest, ...nextNestedRedirs] = nestedRedirs;
  /**
   * Close anything opened explicitly in deepest scope.
   */
  let nextOfd = state.ofd;
  Object.keys(deepest).forEach((fd) =>
    nextOfd = closeFd({ fd: Number(fd), fromFd: deepest, ofd: nextOfd }));
  /**
   * Recompute {fdToOpenKey}, where {reverse} mutates, so must slice.
   */
  const fdToOpenKey = nextNestedRedirs.slice().reverse().reduce(
    (agg, item) => ({ ...agg, ...item }),
    {} as Record<number, string>
  );

  return { ...state,
    proc: updateLookup(processKey, state.proc, () => ({
      nestedRedirs: nextNestedRedirs,
      fdToOpenKey,
    })),
    ofd: nextOfd,
  };
};

/**
 * Remove deepest variable scope in {processKey}.
 */
export const osPopVarScopeAct = createOsAct<OsAct, PopVarScopeAct>(
  OsAct.OS_POP_VAR_SCOPE,
);
interface PopVarScopeAct extends SyncAct<OsAct, { processKey: string }> {
  type: OsAct.OS_POP_VAR_SCOPE;
}
export const osPopVarScopeDef: SyncActDef<OsAct, PopVarScopeAct, State> = ({ processKey }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, ({ nestedVars }) => ({
    // Deepest scope is 1st item of {nestedVars}.
    nestedVars: nestedVars.slice(1),
  })),
});

/**
 * Deepen variable scope in {processKey},
 * inheriting $0 and setting {posPositionals}.
 */
export const osPushPositionalsScopeAct = createOsAct<OsAct, PushPositionalsScopeAct>(
  OsAct.OS_PUSH_POSITIONALS_SCOPE,
);
interface PushPositionalsScopeAct extends SyncAct<OsAct, { processKey: string; posPositionals: string[] }> {
  type: OsAct.OS_PUSH_POSITIONALS_SCOPE;
}
export const osPushPositionalsScopeDef: SyncActDef<OsAct, PushPositionalsScopeAct, State> = ({ processKey, posPositionals }, state) => {
  /**
   * Create new scope containing positive positionals.
   */
  const toVar: ToProcVar = {};
  posPositionals.forEach((value, index) => toVar[index + 1] = {
    key: 'positional',
    index: index + 1,
    varName: String(index + 1),
    value,
    exported: false,
    readonly: true,
    to: null,
  });
  return { ...state,
    proc: updateLookup(processKey, state.proc, ({ nestedVars }) => ({
      nestedVars: [// Include clone of $0 from earliest scope.
        Object.assign(
          toVar,
          { 0: cloneVar((last(nestedVars) as Record<string, ProcessVar>)[0]) }
        ),
        ...nestedVars,
      ],
    })),
  };
};

/**
 * Deepen redirection scope in {processKey}.
 */
export const osPushRedirectScopeAct = createOsAct<OsAct, PushRedirectScopeAct>(
  OsAct.OS_PUSH_REDIRECT_SCOPE,
);
interface PushRedirectScopeAct extends SyncAct<OsAct, { processKey: string }> {
  type: OsAct.OS_PUSH_REDIRECT_SCOPE;
}
export const osPushRedirectScopeDef: SyncActDef<OsAct, PushRedirectScopeAct, State> = ({ processKey }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, ({ nestedRedirs }) => ({
    /**
     * Add fresh scope as 1st item.
     * No need to recompute {fdToOpenKey}.
     */
    nestedRedirs: [{} as Record<number, string>].concat(nestedRedirs),
  })),
});

/**
 * Deepen variable scope in {processKey}, without setting positionals.
 */
export const osPushVarScopeAct = createOsAct<OsAct, PushVarScopeAct>(
  OsAct.OS_PUSH_VAR_SCOPE,
);
interface PushVarScopeAct extends SyncAct<OsAct, { processKey: string }> {
  type: OsAct.OS_PUSH_VAR_SCOPE;
}
export const osPushVarScopeDef: SyncActDef<OsAct, PushVarScopeAct, State> = ({ processKey }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, ({ nestedVars }) => ({
    nestedVars: [{}, ...nestedVars],
  })),
});


/**
 * Set zeroeth positional parameter.
 */
export const osSetZeroethParamAct = createOsAct<OsAct, SetZeroethParamAct>(
  OsAct.OS_SET_ZEROETH_PARAM,
);
interface SetZeroethParamAct extends SyncAct<OsAct,{ processKey: string; $0: string }> {
  type: OsAct.OS_SET_ZEROETH_PARAM;
}
export const osSetZeroethParamDef: SyncActDef<OsAct, SetZeroethParamAct, State> = ({ processKey, $0 }, state) => ({
  ...state,
  proc: updateLookup(processKey, state.proc, ({ nestedVars }) => ({
    nestedVars: [
      Object.assign<ToProcVar, ToProcVar>(nestedVars[0], { 0: createPositional(0, $0, true) }),
      ...nestedVars.slice(1),
    ],
  })),
});

/**
 * Shift +ve positional paramters by non -ve integer to left,
 * e.g. $3 -> $2 -> $1 ->
 */
export const osShiftPositionalsAct = createOsAct<OsAct, ShiftPositionalsAct>(
  OsAct.OS_SHIFT_POSITIONALS,
);
interface ShiftPositionalsAct extends SyncAct<OsAct, { processKey: string; amount: number }> {
  type: OsAct.OS_SHIFT_POSITIONALS;
}
export const osShiftPositionalsDef: SyncActDef<OsAct, ShiftPositionalsAct, State> =
({ amount, processKey }, state) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    return state;// Handle `shift 0`, and safety.
  }
  return { ...state,
    proc: updateLookup(processKey, state.proc, ({ nestedVars }) => {
      // Find deepest positionals scope (always exists).
      const scopeIndex = nestedVars.findIndex((toVar) => 0 in toVar);
      const toVar = { ...nestedVars[scopeIndex] };
      // Find existing positive positions (ascending).
      let i = 0;
      const posPositions = [] as number[];
      while (++i in toVar) {
        posPositions.push(i);
      }
      // Left-shift positional variables with position >= 2.
      posPositions.slice(1).forEach((i) => {
        toVar[i - 1] = {
          ...(toVar[i] as PositionalProcVar),
          index: i - 1,
          varName: `${i - 1}`,
        };
      });
      // Remove last one positive positional (could be 1).
      delete toVar[last(posPositions) as number];
      return {
        nestedVars: [
          ...nestedVars.slice(0, scopeIndex),
          toVar,
          ...nestedVars.slice(scopeIndex + 1),
        ],
      };
    })
  };
};

/**
 * Update function e.g. export.
 */
export const osUpdateFunctionAct = createOsAct<OsAct, UpdateFunctionAct>(
  OsAct.OS_UPDATE_FUNCTION
);
interface UpdateFunctionAct extends SyncAct<OsAct, {
  processKey: string;
  functionName: string;
  updates: Partial<NamedFunction>;
}> {
  type: OsAct.OS_UPDATE_FUNCTION;
}
export const osUpdateFunctionDef: SyncActDef<OsAct, UpdateFunctionAct, State> =
({ processKey, functionName, updates }, state) => {
  delete updates.key;// Safety.
  return { ...state,
    proc: updateLookup(processKey, state.proc, ({ toFunc }) => ({
      toFunc: updateLookup(functionName, toFunc, ({ readonly }) =>
        // Cannot unset `readonly`.
        Object.assign(updates, { readonly: readonly ? true : updates.readonly })
      ),
    })),
  };
};

/**
 * Update specified variable in specified scope of specified process.
 */
export const osUpdateNestedVarAct = createOsAct<OsAct, UpdateNestedVarAct>(
  OsAct.OS_UPDATE_NESTED_VAR
);
interface UpdateNestedVarAct extends SyncAct<OsAct, {
  processKey: string;
  varName: string;
  scopeIndex: number;
  processVar: ProcessVar;
}> {
  type: OsAct.OS_UPDATE_NESTED_VAR;
}
export const osUpdateNestedVarDef: SyncActDef<OsAct, UpdateNestedVarAct, State> = (
  { processKey, processVar, scopeIndex, varName },
  state,
) => ({
  ...state, 
  proc: updateLookup(processKey, state.proc, ({ nestedVars }) => ({
    nestedVars: [
      ...nestedVars.slice(0, scopeIndex),
      { ...nestedVars[scopeIndex], [varName]: processVar },
      ...nestedVars.slice(scopeIndex + 1),
    ],
  })),
});

export type Thunk = (
  | AssignVarThunk
  | ExpandVarThunk
  | FindVarNamesThunk
  | GetFunctionThunk
  | GetFunctionsThunk
  | GetPositionalsThunk
  | GetVarsThunk
  | LookupVarThunk
  | RemoveFunctionThunk
  | RestrictToEnvThunk
  | UnsetVarThunk
);

/**
 * Assign value to variable.
 * Variable needn't exist.
 * Recasts variable if necessary.
 * Declares variable if value null.
 */
export const osAssignVarThunk = createOsThunk<OsAct, AssignVarThunk>(
  OsAct.OS_ASSIGN_VAR_THUNK,
  ({ dispatch, state: { os: { proc } }, service: { processVar } }, def) => {
    const { processKey, varName, act } = def;
    const { nestedVars: ns } = proc[processKey];
    /**
     * Require alphanumeric variable name, where 1st char non-numeric.
     */
    if (!/^[a-z_][a-z0-9_]*$/i.test(varName || '')) {
      throw Error(`\`${varName}' not a valid identifier`);
    }
    /**
     * Local readonly variables cannot be overwritten.
     */
    if (def.local) {
      const found = ns.find((toVar) => varName in toVar);
      if (found && found[varName].readonly) {
        throw Error(`${varName}: readonly variable`);
      }
    }
    /**
     * Index of 1st admissible scope referencing variable.
     * If 'local' assignment, only check deepest scope.
     * Else check all scopes from deepest to shallowest.
     */
    const scopeIndex = (def.local ? [ns[0]] : ns)
      .findIndex((toVar) => varName in toVar);

    if (scopeIndex === -1) {
      /**
       * Variable doesn't exist, so create
       * in deepest or shallowest scope.
       */
      dispatch(osUpdateNestedVarAct({
        processKey,
        processVar: processVar.createVar(def),
        scopeIndex: def.local ? 0 : ns.length - 1,
        varName,
      }));
      return;
    }

    /**
     * Variable exists so, using {curr}, create {next}.
     */
    let nextKey: ProcessVar['key'];
    let next: ProcessVar;

    const curr = ns[scopeIndex][varName];
    if (curr.readonly) {
      throw Error(`${curr.varName}: readonly variable`);
    } else if (curr.key === 'positional') {
      throw Error(`${curr.varName}: positional variable`);
    }
    const { integer } = def;
    /**
     * Compute altered flags, see also initials in {this.createVar}.
     * - {exported} and {readonly} apply to all variables.
     * - {to} is only relevant for strings.
     */
    const flags: VarFlags = {
      exported: def.exported === undefined ? curr.exported : def.exported,
      readonly: def.readonly === undefined ? curr.readonly : def.readonly,
      // null iff should not transform in future.
      to: def.lower === undefined
        ? def.upper === undefined
          ? curr.to
          : def.upper ? 'upper' : null
        : def.lower ? 'lower' : null
    };
    if (def.lower && def.upper) {
      // If both {upper} and {lower} set, then do neither.
      flags.to = null;
    }
    /**
     * Will {next} be integer-based?
     */
    const nextInteger = integer || (
      processVar.isVarKeyNumeric(curr.key)
      && (integer !== false)
    );

    switch (act.key) {
      /**
       * x=(a b c)
       * declare x=(a b c)
       */
      case 'array': {
        // Check if specified integer, or {curr} is integer-based.
        nextKey = nextInteger ? 'integer[]' : 'string[]';
        next = processVar.recastVar(curr, nextKey, flags);
        if (act.value) {// Assign.
          next.value = processVar.isVarKeyNumeric(next.key)
            ? act.value.map((x) => parseInt(x) || 0)
            : processVar.transformVar(flags.to, act.value.slice());
        }
        break;
      }
      /**
       * x[2]=foo
       * x[foo]=bar when x associative
       */
      case 'item': {
        nextKey = nextInteger
          // Should never have `def.associative` and `def.array`.
          ? ((curr.key === 'to-integer' || def.associative) ? 'to-integer' : 'integer[]')
          : ((curr.key === 'to-string' || def.associative) ? 'to-string' : 'string[]');
        next = processVar.recastVar(curr, nextKey, flags);
        processVar.assignVarItem(next, act.index, act.value);
        break;
      }
      /**
       * x=y or x+=y
       * declare x or declare x=y
       */
      case 'default': {
        nextKey = processVar.getDefaultVarKey(curr.key, nextInteger);
        next = processVar.recastVar(curr, nextKey, flags);

        if (act.value !== undefined) {// Not `declare x`.
          processVar.assignVarDefault(next, act.value);
          if (act.append) {// x+=y.
            if (curr.key === 'string' && next.key === 'string') {
              next.value = (curr.value || '') + (next.value || '');
            } else if (curr.key === 'integer' && next.key === 'integer') {
              next.value = (curr.value || 0) + (next.value || 0);
            } 
          }
        }
        break;
      }
      /**
       * x=([foo]=bar [baz]=bim)
       */
      case 'map': {
        nextKey = nextInteger ? 'to-integer' : 'to-string';
        next = processVar.recastVar(curr, nextKey, flags);
        if (act.value) {
          next.value = processVar.isVarKeyNumeric(next.key)
            ? mapValues(act.value, (x) => parseInt(x) || 0)
            : processVar.transformVar(flags.to, act.value);
        }
        break;
      }
      default: throw testNever(act);
    }
    /**
     * Finally, overwrite previous variable in state.
     */
    dispatch(osUpdateNestedVarAct({ processKey, processVar: next, scopeIndex, varName }));
  }
);
interface AssignVarThunk extends OsThunkAct<OsAct, { processKey: string } & AssignVarThunkBase, void> {
  type: OsAct.OS_ASSIGN_VAR_THUNK;
}
export interface AssignVarThunkBase extends Partial<BaseAssignOpts> {
  varName: string;
  act: AssignVarThunkAction;
}
export interface BaseAssignOpts {
  array: boolean;
  associative: boolean;
  exported: boolean;
  integer: boolean;
  /** 
   * If {undefined} or {false} then assign to shallowest scope.
   * If {true} then assign to deepest scope.
   * Not a property of variable i.e. not in {BaseProcessVar}.
   */
  local: boolean;
  /** To lowercase on assign. */
  lower: boolean;
  readonly: boolean;
  /** To uppercase on assign. */
  upper: boolean;
}
/**
 * If {value} undefined then must be declaring.
 */
type AssignVarThunkAction = (
  | { key: 'array'; value?: string[] }// ( a, b, c )
  | { key: 'item'; index: string; value?: string }// x[0]=foo, x[foo]=bar, x[foo]=
  | { key: 'default'; value?: string; append?: boolean }// string or integer.
  | { key: 'map'; value?: Record<string, string> }// ( [a]=1, [b]=2, [c]=3 )
);

/**
 * Return string expansion of ${varName} or ${varName[index]}.
 */
export const osExpandVarThunk = createOsThunk<OsAct, ExpandVarThunk>(
  OsAct.OS_EXPAND_VAR_THUNK,
  ({ dispatch }, { processKey, varName, index }) => {
    const result = dispatch(osLookupVarThunk({ processKey, varName }));
    if (!result) {
      return '';
    } else if (Array.isArray(result)) {
      return String(result[parseInt(index || '0') || 0]) || '';
    } else if (typeof result === 'object') {
      return String(result[index || 0]) || '';
    }
    return String(result);
  },
);
export interface ExpandVarThunk extends OsThunkAct<
OsAct,
{ processKey: string; varName: string; index?: string },
string
>{
  type: OsAct.OS_EXPAND_VAR_THUNK;
}

/**
 * Find all variables in {processKey} with prefix {varPrefix}.
 */
export const osFindVarNamesThunk = createOsThunk<OsAct, FindVarNamesThunk>(
  OsAct.OS_FIND_VAR_NAMES_THUNK,
  ({ state: { os }}, { processKey, varPrefix }) => {
    const found = new Set<string>();
    os.proc[processKey].nestedVars.forEach((toVar) => {
      Object.keys(toVar)
        .filter((varName) => varName.startsWith(varPrefix))
        .forEach((varName) => found.add(varName));
    });
    return Array.from(found);
  },
);
interface FindVarNamesThunk extends OsThunkAct<OsAct, { processKey: string; varPrefix: string }, string[]> {
  type: OsAct.OS_FIND_VAR_NAMES_THUNK;
}

/**
 * Get named function defined in process.
 */
export const osGetFunctionThunk = createOsThunk<OsAct, GetFunctionThunk>(
  OsAct.OS_GET_FUNCTION_THUNK,
  ({ state: { os: { proc }}}, { functionName, processKey }) => {
    return proc[processKey].toFunc[functionName] || null;
  },
);
export interface GetFunctionThunk extends OsThunkAct<OsAct,
{ processKey: string; functionName: string },
NamedFunction | null
> {
  type: OsAct.OS_GET_FUNCTION_THUNK;
}

/**
 * Get all functions for {processKey}.
 */
export const osGetFunctionsThunk = createOsThunk<OsAct, GetFunctionsThunk>(
  OsAct.OS_GET_FUNCTIONS_THUNK,
  ({ state: { os: { proc }}}, { processKey }) => Object.values(proc[processKey].toFunc),
);
interface GetFunctionsThunk extends OsThunkAct<OsAct, { processKey: string }, NamedFunction[]> {
  type: OsAct.OS_GET_FUNCTIONS_THUNK;
}

/**
 * Outputs all positionals [$0, $1, $2, ...].
 * Positionals variables may only have string value.
 */
export const osGetPositionalsThunk = createOsThunk<OsAct, GetPositionalsThunk>(
  OsAct.OS_GET_POSITIONALS_THUNK,
  ({ state: { os } }, { processKey }) => {
    const { nestedVars } = os.proc[processKey];
    /**
     * Positionals are in 1st scope containing 0.
     * Such a scope always exists i.e. the last item in {nestedVars}.
     */
    const toVar = nestedVars.find((toVar) => 0 in toVar);
    if (toVar) {// Collect all positions, starting from 0.
      let i = -1;
      const positions = [] as number[];
      while (++i in toVar) {
        positions.push(i);
      }
      // console.log({ positions });
      return positions.map((i) => (toVar[i] as BasePositionalVar).value);
    }// Internal error, should never occur.
    throw Error('positional variables not found in process');
  },
);
interface GetPositionalsThunk extends OsThunkAct<OsAct, { processKey: string }, string[]> {
  type: OsAct.OS_GET_POSITIONALS_THUNK;
}

/**
 * Get all variables accessible from current scope of {processKey}.
 */
export const osGetVarsThunk = createOsThunk<OsAct, GetVarsThunk>(
  OsAct.OS_GET_VARS_THUNK,
  ({ state: { os: { proc }}}, { processKey }) => {
    const { nestedVars } = proc[processKey];
    const tempLookup = nestedVars.slice().reverse()
      .reduce<Record<string, ProcessVar>>(
      (agg, toVar) => ({ ...agg, ...toVar }),
      {},
    );
    return Object.values(tempLookup);
  },
);
interface GetVarsThunk extends OsThunkAct<OsAct, { processKey: string }, ProcessVar[]> {
  type: OsAct.OS_GET_VARS_THUNK;
}

/**
 * Lookup variable.
 * undefined iff not found.
 * null means explicitly unset, or never set.
 * TODO system variables e.g. FUNCNAME.
 */
export const osLookupVarThunk = createOsThunk<OsAct, LookupVarThunk>(
  OsAct.OS_LOOKUP_VAR_THUNK,
  ({ state: { os } }, { processKey, varName }) => {
    const { nestedVars } = os.proc[processKey];
    const found = nestedVars.find((toVar) => varName in toVar);
    return found ? found[varName].value : undefined;
  },
);
export interface LookupVarThunk extends OsThunkAct<OsAct,
{ processKey: string; varName: string },
ProcessVar['value'] | undefined
> {
  type: OsAct.OS_LOOKUP_VAR_THUNK;
}

/**
 * Remove function from {processKey} unless readonly.
 */
export const osRemoveFunctionThunk = createOsThunk<OsAct, RemoveFunctionThunk>(
  OsAct.OS_REMOVE_FUNCTION_THUNK,
  ({ state: { os }, dispatch }, { processKey, funcName }) => {
    const { toFunc } = os.proc[processKey];
    if (toFunc[funcName]) {
      if (toFunc[funcName].readonly) {
        throw new TermError(`${funcName}: cannot remove: readonly function`, 1);
      }
      dispatch(osUpdateProcessAct({
        processKey,
        updater: () => ({ toFunc: withoutProperty({ ...toFunc }, funcName) })
      }));
    }

  },
);
export interface RemoveFunctionThunk extends OsThunkAct<OsAct, { processKey: string; funcName: string }, void> {
  type: OsAct.OS_REMOVE_FUNCTION_THUNK;
}

/**
 * Restrict to environment variables and exported functions.
 * Apply provided positive positionals $1, $2, ...
 */
export const osRestrictToEnvThunk = createOsThunk<OsAct, RestrictToEnvThunk>(
  OsAct.OS_RESTRICT_TO_ENV_THUNK,
  ({ dispatch, state: { os }, service }, { processKey, posPositionals }) => {
    const { nestedVars, toFunc } = os.proc[processKey];
    /**
     * Clone environment variables, excluding positive positionals.
     */
    const initToVar = {} as ToProcVar;
    const envVars = flatten(
      nestedVars.map((toVar) =>
        Object.values(toVar)
          .filter(({ exported, key, varName }) => exported && (key !== 'positional' || varName === '0'))
          .map((x) => cloneVar(x))
      )
    );
    envVars.reverse().forEach((varDef) => initToVar[varDef.varName] = varDef);

    /**
     * Add specified positive positionals.
     */
    posPositionals.forEach((value, index) =>
      initToVar[index + 1] = createPositional(index + 1, value)
    );

    /**
     * Clone exported functions.
     */
    const nextToFunc = {} as Record<string, NamedFunction>;
    Object.values(toFunc).filter(({ exported }) => exported).forEach((namedFn) =>
      nextToFunc[namedFn.key] = service.term.cloneFunc(namedFn)
    );

    dispatch(osUpdateProcessAct({
      processKey,
      updater: () => ({ nestedVars: [initToVar], toFunc }),
    }));
  }
);

interface RestrictToEnvThunk extends OsThunkAct<OsAct, { processKey: string; posPositionals: string[] }, void> {
  type: OsAct.OS_RESTRICT_TO_ENV_THUNK;
}

/**
 * Unset a variable, if exists.
 * We replace leftmost occurrence with var of type 'unset'.
 * Then can {local x=foo; unset x} without effecting earlier {x}.
 */
export const osUnsetVarThunk = createOsThunk<OsAct, UnsetVarThunk>(
  OsAct.OS_UNSET_VAR_THUNK,
  ({ dispatch, state: { os } }, { processKey, varName }) => {
    const { nestedVars } = os.proc[processKey];
    const index = nestedVars.findIndex((toVar) => varName in toVar);

    if (index === -1) {// Skip if variable n'exist pas.
      return;
    }
    const prevVar = nestedVars[index][varName];
    if (prevVar.key === 'positional') {// Cannot unset positional.
      return;
    }

    dispatch(osUpdateProcessAct({ processKey, updater: ({ nestedVars }) => ({
      nestedVars: [
        ...nestedVars.slice(0, index),
        { ...nestedVars[index],
          [varName]: {
            key: 'unset',
            varName,
            value: null,
            exported: false,
            readonly: false,
            to: null,
          }},
        ...nestedVars.slice(index + 1),
      ]}),
    }));
  },
);
interface UnsetVarThunk extends OsThunkAct<OsAct, { processKey: string; varName: string }, void> {
  type: OsAct.OS_UNSET_VAR_THUNK;
}
