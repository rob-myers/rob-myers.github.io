import { testNever, mapValues, last } from "@model/generic.model";
import useStore, { Process } from '@store/shell.store';
import { ProcessVar, BasePositionalVar, AssignVarBase } from "./var.model";
import { ShError } from "./transpile.service";
import { parseSh, Stmt, FileMeta } from "./parse.service";

const alphaNumeric = /^[a-z_][a-z0-9_]*/;

export class VarService {
  /**
   * TODO could save transpilation of function?
   */
  addFunction(pid: number, name: string, stmt: Stmt) {
    const node = parseSh.wrapInFile(stmt);
    const { sessionKey } = this.getProcess(pid);
    const { sid } = this.getSession(sessionKey);
    Object.assign<FileMeta, FileMeta>(node.meta, { pid, sessionKey, sid });

    this.getProcess(pid).toFunc[name] = {
      key: name,
      exported: false,
      readonly: false,
      src: null,
      node,
    };
  }

  /**
   * Assign value to variable:
   * - it needn't exist, otherwise recasts 
   * - recasts variable if necessary.
   * - declares variable if value null.
   */
  assignVar(pid: number, def: AssignVarBase) {
    // Require alphanumeric variable name where 1st char non-numeric
    const { varName } = def;
    if (!varName || !alphaNumeric.test(varName)) {
      throw new ShError(`\`${varName}' not a valid identifier`, 1);
    }

    // Index of 1st admissible scope referencing variable.
    // If `local` only check deepest scope, else deepest to shallowest
    const { nestedVars } = this.getProcess(pid);
    const scopeIndex = (def.local ? [nestedVars[0]] : nestedVars)
      .findIndex((toVar) => varName in toVar);

    if (scopeIndex === -1) {// Create in deepest/shallowest scope
      const newVar = this.createVar(def);
      this.updateNestedVar(pid, varName, def.local ? 0 : nestedVars.length - 1, newVar);
      return;
    }

    /** Variable exists so use `curr` to create `next`. */
    const curr = nestedVars[scopeIndex][varName];
    if (curr.readonly && !def.force) {
      throw new ShError(`${curr.varName}: readonly variable`, 1);
    } else if (curr.key === 'positional') {
      throw new ShError(`${curr.varName}: positional variable`, 1);
    } else if (curr.key === 'unset') {
      return; // Unreachable?
    }
    
    const next: ProcessVar = { ...curr };
    const { act, integer } = def;
    integer && this.castAsIntegerBased(next);

    switch (act.key) {
      /**
       * x=y or x+=y
       * declare x or declare x=y
       */
      case 'default': {
        if (act.value !== undefined) {// Not `declare x`
          if (act.append && Array.isArray(curr.value) && Array.isArray(next.value)) {
            // x+=y where x is an array
            next.value[0] += curr.value;
          } else {
            this.assignVarDefault(next, act.value, integer);
            if (act.append) {// x+=y
              next.value = curr.value + next.value
            }
          }
        }
        break;
      }
      /**
       * x[2]=foo
       * x[foo]=bar when x associative
       */
      case 'item':
        this.assignVarItem(next, act.index, act.value, integer);
        break;
      /**
       * x=(a b c)
       * declare x=(a b c)
       */
      case 'array':
      /**
       * x=([foo]=bar [baz]=bim)
       */
      case 'map':
      case 'simple':
        next.value = act.value || null;
        break;
      default:
        throw testNever(act);
    }

    // Finally, overwrite previous variable in state
    this.updateNestedVar(pid, varName, scopeIndex, next);
  }

  /**
   * Apply x=y (or x+=y) to process variable v
   * where x is `v.name` and y is `value`.
   */
  assignVarDefault(v: ProcessVar, value: any, integer?: boolean): void {
    switch (v.key) {
      case 'plain': {
        if (v.value instanceof Array) {
          v.value[0] = integer ? parseInt(value) || 0 : value;
        } else if (v.value && typeof v.value === 'object') {
          v.value[0] = integer ? parseInt(value) || 0 : value;
        } else {
          v.value = integer ? parseInt(value) || 0 : value;
        }
        break;
      }
      case 'unset':
        v.value = null;
        break;
      case 'positional':
        throw new ShError(`Cannot assign default ${value} to var ${v.varName}: ${v.key}`, 1);
      default:
        throw testNever(v);
    }
  }

  /**
   * Apply v[key]=value to process variable `v`.
   * We support `declare v[key]`, where the value is undefined.
   */
  assignVarItem(v: ProcessVar, key: string, value: any, integer?: boolean): void {
    if (v.value instanceof Array) {
      v.value[parseInt(key) || 0] = integer ? (parseInt(value) || 0) : value;
    } else if (v.value && typeof v.value === 'object') {
      v.value[key] = integer ? (parseInt(value) || 0) : value;
    } else {
      throw new ShError(`cannot assign kv-pair (${key}, ${value}) to var ${v.varName}: ${v.key}`, 1);
    }
  }

  createVar(def: AssignVarBase): ProcessVar {
    const { integer, act, varName } = def;
    const base = { varName, exported: !!def.exported, readonly: !!def.readonly };

    switch (act.key) {
      case 'array':
        return integer
          ? { ...base, key: 'plain', value: act.value == null ? null : act.value.map((x) => parseInt(x) || 0) }
          : { ...base, key: 'plain', value: act.value == null ? null : act.value };
      case 'item': {
        let value = null as (number | string)[] | null;
        if (act.value) {
          value = [];
          value[parseInt(act.index) || 0] = integer ? (parseInt(act.value) || 0) : act.value;
        }
        return integer
          ? { ...base, key: 'plain', value: value as number[] | null }
          : { ...base, key: 'plain', value: value as string[] | null };
      }
      case 'default':
      case 'simple':
        return integer
          ? { ...base, key: 'plain', value: (act.value == null) ? null : (parseInt(act.value) || 0) }
          : { ...base, key: 'plain', value: (act.value == null) ? null : act.value };
      case 'map':
        return integer
          ? { ...base, key: 'plain', value: (act.value == null) ? null : mapValues(act.value, (x) => parseInt(x) || 0) }
          : { ...base, key: 'plain', value: act.value == null ? null : act.value };
      default:
        throw testNever(act);
    }
  }

  expandVar(pid: number, varName: string) {
    const result = this.lookupVar(pid, varName);
    if (typeof result === 'string') {
      return result;
    }
    return JSON.stringify(result);
  }

  /** Find all variables in `pid` with prefix `varPrefix`. */
  findVarNames(pid: number, varPrefix: string) {
    const found = new Set<string>();
    this.getProcess(pid).nestedVars.forEach((toVar) => {
      Object.keys(toVar)
        .filter((varName) => varName.startsWith(varPrefix))
        .forEach((varName) => found.add(varName));
    });
    return Array.from(found);
  }

  getFunction(pid: number, functionName: string) {
    return this.getProcess(pid).toFunc[functionName] || null
  }

  /**
   * Positionals are in 1st scope containing 0.
   * Such a scope always exists i.e. the last item in `nestedVars`.
   */
  getPositionals(pid: number): string[] {
    const { nestedVars } = this.getProcess(pid)
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

  private getSession(sessionKey: string) {
    return useStore.getState().session[sessionKey];
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

  lookupVar(pid: number, varName: string): ProcessVar['value'] | undefined {
    const { nestedVars } = this.getProcess(pid);
    const found = nestedVars.find((toVar) => varName in toVar);
    return found ? found[varName].value : undefined;
  }

  /**
   * Pop variable scopes up to and including deepest where
   * positionals were set. This action should always be guarded by
   * `pushPositionalScope`, so original scope is never popped.
   */
  popPositionalsScope(pid: number) {
    const process = this.getProcess(pid);
    // Index of deepest scope where positionals were set (shouldn't be 0)
    const scopeIndex = process.nestedVars.findIndex((toVar) => 0 in toVar);
    process.nestedVars = process.nestedVars.slice(scopeIndex + 1);
  }

  /** Create new scope containing positive positionals and 0. */
  pushPositionalsScope(pid: number, posPositionals: string[]) {
    const { nestedVars } = this.getProcess(pid);
    const toVar = {} as Record<string, ProcessVar>;
    posPositionals.forEach((value, index) => toVar[index + 1] = {
      key: 'positional',
      index: index + 1,
      varName: String(index + 1),
      value,
      exported: false,
      readonly: true,
    });
    // Include $0 from earliest scope
    Object.assign(toVar, { 0: (last(nestedVars)!)[0] });
    nestedVars.unshift(toVar);
  }

  private castAsIntegerBased(v: ProcessVar) {
    if (v.value instanceof Array) {
      v.value = v.value.map(x => parseInt(x, 10) || 0);
    } else if (v.value && typeof v.value === 'object') {
      Object.keys(v.value).forEach(key => v.value[key] = parseInt(v.value[key]) || 0)
    } else {
      v.value = parseInt(v.value) || 0;
    }
    return v;
  }

  private updateNestedVar(
    pid: number,
    varName: string,
    scopeIndex: number,
    processVar: ProcessVar,
  ) {
    const process = this.getProcess(pid);
    process.nestedVars = [
      ...process.nestedVars.slice(0, scopeIndex),
      { ...process.nestedVars[scopeIndex], [varName]: processVar },
      ...process.nestedVars.slice(scopeIndex + 1),
    ];
  }

}

export const varService = new VarService;
