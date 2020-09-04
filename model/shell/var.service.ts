import { testNever, mapValues, isStringInt } from "@model/generic.model";
import useStore, { Process } from '@store/shell.store';
import { ProcessVar, BasePositionalVar, AssignVarBase, VarFlags, NamedFunction } from "./var.model";
import { ShError } from "./transpile.service";
import { parseSh } from "./parse.service";

export class VarService {

  /**
   * Assign value to variable.
   * Variable needn't exist.
   * Recasts variable if necessary.
   * Declares variable if value null.
   */
  assignVar(pid: number, def: AssignVarBase) {
    const { varName, act } = def;
    const { nestedVars: nVars } = this.getProcess(pid);
    
    // Require alphanumeric variable name where 1st char non-numeric.
    if (!/^[a-z_][a-z0-9_]*$/i.test(varName || '')) {
      throw new ShError(`\`${varName}' not a valid identifier`, 1);
    }
    // Local readonly variables cannot be overwritten.
    if (def.local) {
      const found = nVars.find((toVar) => varName in toVar);
      if (found && found[varName].readonly && !def.force) {
        throw new ShError(`${varName}: readonly variable`, 1);
      }
    }
    /**
     * Index of 1st admissible scope referencing variable.
     * If 'local' assignment, only check deepest scope.
     * Else check all scopes from deepest to shallowest.
     */
    const scopeIndex = (def.local ? [nVars[0]] : nVars)
      .findIndex((toVar) => varName in toVar);

    if (scopeIndex === -1) {
      /**
       * Variable doesn't exist, so create it
       * in the deepest or shallowest scope.
       */
      this.updateNestedVar({
        pid,
        processVar: this.createVar(def),
        scopeIndex: def.local ? 0 : nVars.length - 1,
        varName,
      });
      return;
    }

    /**
     * Variable exists so, using {curr}, create {next}.
     */
    let nextKey: ProcessVar['key'];
    let next: ProcessVar;

    const curr = nVars[scopeIndex][varName];
    if (curr.readonly && !def.force) {
      throw new ShError(`${curr.varName}: readonly variable`, 1);
    } else if (curr.key === 'positional') {
      throw new ShError(`${curr.varName}: positional variable`, 1);
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
      this.isVarKeyNumeric(curr.key)
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
        next = this.recastVar(curr, nextKey, flags);
        if (act.value) {// Assign.
          next.value = this.isVarKeyNumeric(next.key)
            ? act.value.map((x) => parseInt(x) || 0)
            : this.transformVar(flags.to, act.value.slice());
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
        next = this.recastVar(curr, nextKey, flags);
        this.assignVarItem(next, act.index, act.value);
        break;
      }
      /**
       * x=y or x+=y
       * declare x or declare x=y
       */
      case 'default': {
        nextKey = this.getDefaultVarKey(curr.key, nextInteger);
        next = this.recastVar(curr, nextKey, flags);

        if (act.value !== undefined) {// Not `declare x`.
          if (act.append && Array.isArray(curr.value) && Array.isArray(next.value)) {
            // x+=y where x is an array
            if (typeof curr.value[0] === 'string') {
              this.assignVarItem(next, '0', curr.value[0] + act.value);
            } else {
              const delta = isStringInt(act.value) ? Number(act.value) : 0;
              this.assignVarItem(next, '0', (curr.value[0] + delta).toString());
            }
          } else {
            this.assignVarDefault(next, act.value);
            if (act.append) {// x+=y
              if (curr.key === 'string' && next.key === 'string') {
                next.value = (curr.value || '') + (next.value || '');
              } else if (curr.key === 'integer' && next.key === 'integer') {
                next.value = (curr.value || 0) + (next.value || 0);
              } 
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
        next = this.recastVar(curr, nextKey, flags);
        if (act.value) {
          next.value = this.isVarKeyNumeric(next.key)
            ? mapValues(act.value, (x) => parseInt(x) || 0)
            : this.transformVar(flags.to, act.value);
        }
        break;
      }
      default: throw testNever(act);
    }
    /**
     * Finally, overwrite previous variable in state.
     */
    this.updateNestedVar({ pid, processVar: next, scopeIndex, varName });
  }

  /**
   * Apply x=y (or x+=y) to process variable v
   * where x is {v.name} and y is {value}.
   */
  assignVarDefault(v: ProcessVar, value: string): void {
    switch (v.key) {
      case 'integer[]': {
        if (v.value) v.value[0] = parseInt(value) || 0;
        else v.value = [parseInt(value) || 0];
        break;
      }
      case 'string[]': {
        if (v.value) v.value[0] = value;
        else v.value = [value];
        v.value = this.transformVar(v.to, v.value) as string[];
        break;
      }
      case 'to-integer': {
        if (v.value) v.value[0] = parseInt(value) || 0;
        else v.value = { 0: parseInt(value) || 0 };
        break;
      }
      case 'to-string': {
        if (v.value) v.value[0] = value;
        else v.value = { 0: value };
        v.value = this.transformVar(v.to, v.value) as Record<string, string>;
        break;
      }
      case 'unset': {
        v.value = null;
        break;
      }
      case 'string': {
        v.value = this.transformVar(v.to, value) as string;
        break;
      }
      case 'integer': {
        v.value = parseInt(value) || 0;
        break;
      }
      case 'positional': {
        throw Error(`Cannot assign default ${value} to var ${v.varName}: ${v.key}.`);
      }
      default: throw testNever(v);
    }
  }

  /**
   * Apply v[key]=value to process variable {v}.
   * We support declare v[key], where the value is undefined.
   */
  assignVarItem(
    v: ProcessVar,
    key: string,
    value?: string,
  ): void {

    switch (v.key) {
      case 'integer[]': {
        if (v.value) {
          if (value !== undefined) {
            v.value[parseInt(key) || 0] = parseInt(value) || 0;
          }
        } else {
          v.value = value === undefined ? [] : [parseInt(value) || 0];
        }
        break;
      }
      case 'string[]': {
        v.value = v.value || [];
        if (value !== undefined) {
          v.value[parseInt(key) || 0] = value;
        }
        v.value = this.transformVar(v.to, v.value) as string[];
        break;
      }
      case 'to-integer': {
        if (v.value) {
          if (value !== undefined) {
            v.value[key] = parseInt(value) || 0;
          }
        } else {
          v.value = value === undefined ? {} : { [key]: parseInt(value) || 0 };
        }
        break;
      }
      case 'to-string': {
        if (v.value) {
          if (value !== undefined) {
            v.value[key] = value;
          }
        } else {
          v.value = value === undefined ? {} : { [key]: value };
        }
        v.value = this.transformVar(v.to, v.value) as Record<string, string>;
        break;
      }
      case 'unset':
      case 'string':
      case 'integer':
      case 'positional': {
        throw Error(`cannot assign kv-pair (${key}, ${value}) to var ${v.varName}: ${v.key}.`);
      }
      default: throw testNever(v);
    }
  }

  /** Clone a function for use inside current process */
  cloneFunc(func: NamedFunction): NamedFunction {
    return {
      ...func,
      node: parseSh.clone(func.node),
    };
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

  createVar(def: AssignVarBase): ProcessVar {
    const { varName, integer, act } = def;
    const flags: VarFlags = {
      exported: Boolean(def.exported),
      readonly: Boolean(def.readonly),
      // null iff should not transform now.
      to: def.lower === undefined
        ? def.upper === undefined
          ? null
          : def.upper ? 'upper' : null
        : def.lower ? 'lower' : null
    };
    if (def.lower && def.upper) {
      // If both {upper} and {lower} then do neither.
      flags.to = null;
    }
    const base = { varName, ...flags };
  
    // To lowercase or uppercase, if relevant.
    if (!integer && base.to && act.value) {
      act.value = this.transformVar(base.to, act.value);
    }
  
    switch (act.key) {
      case 'array': {
        return integer
          ? { ...base, key: 'integer[]',
            value: (act.value == null) ? null : act.value.map((x) => parseInt(x) || 0) }
          : { ...base, key: 'string[]',
            value: (act.value == null) ? null : act.value };
      }
      case 'item': {
        let value = null as (number | string)[] | null;
        if (act.value) {
          value = [];
          value[parseInt(act.index) || 0] = integer ? (parseInt(act.value) || 0) : act.value;
        }
        return integer
          ? { ...base, key: 'integer[]', value: value as number[] | null }
          : { ...base, key: 'string[]', value: value as string[] | null };
      }
      case 'default':
        return integer
          ? { ...base, key: 'integer',
            value: (act.value == null) ? null : (parseInt(act.value) || 0) }
          : { ...base, key: 'string', value: (act.value == null) ? null : act.value };
      case 'map': {
        return integer
          ? { ...base, key: 'to-integer',
            value: (act.value == null) ? null : mapValues(act.value, (x) => parseInt(x) || 0) }
          : { ...base, key: 'to-string', value: act.value == null ? null : act.value };
      }
      default: throw testNever(act);
    }
  }

  /**
   * Declare a variable without setting a value.
   */
  private declareVar(
    varName: string,
    key: ProcessVar['key'],
    flags: VarFlags,
  ): ProcessVar {
    return {
      key: key as 'string',// 'string' arbitrary, but ensures type.
      varName,
      exported: flags.exported,
      readonly: flags.readonly,
      value: null,
      to: flags.to,
    };
  }

  expandVar(pid: number, varName: string, index?: string) {
    const result = this.lookupVar(pid, varName);
    if (!result) {
      return '';
    } else if (Array.isArray(result)) {
      return String(result[parseInt(index || '0') || 0]) || '';
    } else if (typeof result === 'object') {
      return String(result[index || 0]) || '';
    }
    return String(result);
  }

  /**
   * Find all variables in {processKey} with prefix {varPrefix}.
   */
  findVarNames(pid: number, varPrefix: string) {
    const found = new Set<string>();
    this.getProcess(pid).nestedVars.forEach((toVar) => {
      Object.keys(toVar)
        .filter((varName) => varName.startsWith(varPrefix))
        .forEach((varName) => found.add(varName));
    });
    return Array.from(found);
  }

  /**
   * Given current variable type {prevKey} and whether desire integer-based,
   * return new type after assignment x=foo.
   */
  getDefaultVarKey(
    prevKey: ProcessVar['key'],
    /** Want integer-based type? */
    integer: boolean,
  ): ProcessVar['key'] {
    if (prevKey === 'positional') {
      throw Error('Positional variables have no default assignment key.');
    }
    if (integer) {
      switch (prevKey) {
        case 'integer':
        case 'string':
        case 'unset':
          return 'integer';
        case 'integer[]':
        case 'string[]':
          return 'integer[]';
        case 'to-integer':
        case 'to-string':
          return 'to-integer';
        default: throw testNever(prevKey);
      } 
    }
    // } else if (prevKey === 'unset') {
    //   return 'string';
    // }// Otherwise use previous.
    // return prevKey;
    switch (prevKey) {
      case 'integer':
      case 'string':
      case 'unset':
        return 'string';
      case 'integer[]':
      case 'string[]':
        return 'string[]';
      case 'to-integer':
      case 'to-string':
        return 'to-string';
      default: throw testNever(prevKey);
    } 
  }

  getFunction(pid: number, functionName: string) {
    return this.getProcess(pid).toFunc[functionName] || null
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

  getVarKeys(value: undefined | ProcessVar['value']): string[] {
    if (value && typeof value === 'object') {
      return Object.keys(value);
    }
    return [];
  }

  getVarValues(
    index: string | null,
    value: undefined | ProcessVar['value']
  ): string[] {
    if (value == null) {
      // undefined ~ never set, null: declared but not set, or unset.
      return [];
    } else if (Array.isArray(value)) {
      // Must remove empties e.g. crashes getopts.
      return index === '@' || index === '*'
        ? (value as any[]).filter((x) => x !== undefined).map(String)
        : [String(value[index ? parseInt(index) : 0])];
    } else if (typeof value === 'object') {
      return index === '@' || index === '*'
        ? Object.values(value as Record<string, string | number>).map(String)
        : [String(value[index || 0])];
    }
    return [String(value)];
  }

  async invokeFunction(pid: number, func: NamedFunction) {
    /**
     * TODO
     */
    console.log(`TODO invoke function ${func.key}`);
  }

  isVarKeyNumeric(
    key: ProcessVar['key'],
  ): key is 'integer' | 'integer[]' | 'to-integer' {
    switch (key) {
      case 'positional':
      case 'string':
      case 'string[]':
      case 'to-string':
      case 'unset':
        return false;
      case 'integer':
      case 'integer[]':
      case 'to-integer':
        return true;
      default: throw testNever(key);
    }
  }

  lookupVar(pid: number, varName: string): ProcessVar['value'] | undefined {
    const { nestedVars } = this.getProcess(pid);
    const found = nestedVars.find((toVar) => varName in toVar);
    return found ? found[varName].value : undefined;
  }

  recastVar(
    prev: ProcessVar,
    nextKey: ProcessVar['key'],
    flags: VarFlags,
  ): ProcessVar {

    const base = {
      varName: prev.varName,
      ...flags,
    };
  
    if (nextKey === prev.key) {
      // Clone if key hasn't changed, updating flags.
      return { ...prev, ...base };
    } else if (prev.key === 'positional' || nextKey === 'positional') {
      throw Error('cannot recast positional variable');
    } else if (prev.value === null) {// Was never set (versus 'unset').
      return this.declareVar(prev.varName, nextKey, flags);
    }
  
    switch (nextKey) {
      case 'string': {
        const value = typeof prev.value === 'object' ? String((prev.value as any)[0]) : String(prev.value);
        return { key: 'string', ...base, value: this.transformVar(flags.to, value) as string };
      }
      case 'integer': {
        return { key: 'integer', ...base, value: typeof prev.value === 'object'
          ? (parseInt((prev.value as any)[0]) || 0)
          : (parseInt(String(prev.value)) || 0)
        };
      }
      case 'integer[]': {
        return { key: 'integer[]', ...base, value: typeof prev.value === 'object'
          ? Object.keys(prev.value).map((key) =>
            prev.value ? (parseInt(String((prev.value as any)[key])) || 0) : 0)
          : [parseInt(String(prev.value)) || 0],
        };
      }
      case 'string[]': {
        const value = typeof prev.value === 'object'
          ? Object.keys(prev.value).map((key) => prev.value ? String((prev.value as any)[key]) : '')
          : [String(prev.value)];
        return { key: 'string[]', ...base, value: this.transformVar(flags.to, value) as string[] };
      }
      case 'to-integer': {
        const value = {} as Record<string, number>;
        if (typeof prev.value === 'object') {
          Object.keys(prev.value).forEach((k) =>
            value[k] = prev.value ? (parseInt(String((prev.value as any)[k])) || 0) : 0);
        } else {
          value[0] = parseInt(String(prev.value)) || 0;
        }
        return { key: 'to-integer', ...base, value };
      }
      case 'to-string': {
        const value = {} as Record<string, string>;
        if (typeof prev.value === 'object') {
          Object.keys(prev.value).forEach((k) =>
            value[k] = prev.value ? String((prev.value as any)[k]) : '');
        } else {
          value[0] = String(prev.value);
        }
        return { key: 'to-string', ...base, value: this.transformVar(flags.to, value) as Record<string, string> };
      }
      case 'unset': {
        return {
          key: 'unset',
          varName: prev.varName,
          exported: false,
          readonly: false,
          value: null,
          to: null,
        };
      }
      default: throw testNever(nextKey);
    }
  }

  transformVar(
    to: VarFlags['to'],
    value: string | string[] | Record<string, string>,
  ) {
    // console.log('Before', value);
    if (!to || !value) {
      return value;
    }
    if (typeof value === 'string') {
      (to === 'lower') && (value = value.toLowerCase());
      (to === 'upper') && (value = value.toUpperCase());
    } else if (Array.isArray(value)) {
      (to === 'lower') && (value = value.map((x) => x.toLowerCase()));
      (to === 'upper') && (value = value.map((x) => x.toUpperCase()));
    } else {
      (to === 'lower') && (value = mapValues(value, (x) => x.toLowerCase()));
      (to === 'upper') && (value = mapValues(value, (x) => x.toUpperCase()));
    }
    // console.log('After', value);
    return value;
  }

  private updateNestedVar({ pid, scopeIndex, varName, processVar }: {
    pid: number;
    varName: string;
    scopeIndex: number;
    processVar: ProcessVar;
  }) {
    const process = this.getProcess(pid);
    process.nestedVars = [
      ...process.nestedVars.slice(0, scopeIndex),
      { ...process.nestedVars[scopeIndex], [varName]: processVar },
      ...process.nestedVars.slice(scopeIndex + 1),
    ];
  }

  private getProcess(pid: number): Process {
    return useStore.getState().proc[pid];
  }

}

export const varService = new VarService;
