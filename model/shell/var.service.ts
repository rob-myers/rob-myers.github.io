import { testNever, mapValues, last, isArrayOrObject } from "@model/generic.model";
import { FileMeta } from "./parse.model";
import useStore, { Process } from '@store/shell.store';
import { ProcessVar, BasePositionalVar, AssignVarOpts, ShellFuncDef, JsFuncDef } from "./var.model";
import { ShError } from "./semantics.service";
import { processService } from "./process.service";
import safeJsonStringify from "safe-json-stringify";

export const alphaNumericRegex = /^[a-z_][a-z0-9_]*/i;

class VarService {
  
  private subshellVarName = '__subshell__';
  private subshellVar: ProcessVar = {
    key: 'plain',
    varName: this.subshellVarName,
    value: true,
    exported: false,
    readonly: true,
  };

  addFunction(pid: number, name: string, def: ShellFuncDef | JsFuncDef) {
    if (def.type === 'shell') {
      const { sessionKey } = this.getProcess(pid);
      const { sid } = this.getSession(sessionKey);
      Object.assign<FileMeta, FileMeta>(def.node.meta, { pid, sessionKey, sid });
    };
    this.getProcess(pid).toFunc[name] = {
      key: name,
      exported: false,
      readonly: false,
      src: null,
      ...def,
    };
  }

  /**
   * Assign value to variable in process scope,
   * either using shell rules or by simply assigning it.
   */
  assignVar(pid: number, def: AssignVarOpts) {
    // Require alphanumeric variable name where 1st char non-numeric
    if (!def.varName || (!alphaNumericRegex.test(def.varName) && !def.internal)) {
      throw new ShError(`\`${def.varName}' not a valid identifier`, 1);
    }

    // Index of 1st admissible scope referencing variable.
    // - if `def.local` then only check deepest scope.
    // - else check deepest up-to-and-including 1st with key `__subshell__`.
    const { nestedVars } = this.getProcess(pid);
    const subshellIndex = nestedVars.findIndex(s => this.subshellVarName in s);
    const finalScopeIndex = def.local ? 0 : subshellIndex === -1 ? nestedVars.length - 1 : subshellIndex;
    const scopeIndex = nestedVars.slice(0, finalScopeIndex + 1)
      .findIndex((toVar) => def.varName in toVar);

    if (scopeIndex === -1) {// Create in oldest possible scope
      const newVar = this.createVar(def);
      this.updateNestedVar(pid, def.varName, finalScopeIndex, newVar);
      return;
    }

    /** Variable exists so use `curr` to create `next`. */
    const curr = nestedVars[scopeIndex][def.varName];
    if (curr.readonly && !def.force) {
      throw new ShError(`${curr.varName}: readonly variable`, 1);
    } else if (curr.key === 'positional') {
      throw new ShError(`${curr.varName}: positional variable`, 1);
    } else if (curr.key === 'unset') {
      return; // Unreachable?
    }
    
    const next: ProcessVar = { ...curr };

    if (def.shell) {
      if (def.integer) {
        this.castAsIntegerBased(next);
      }
      if (def.index !== undefined) {
        this.assignVarItem(next, def.index, def.value, def.integer);
      } else if (def.value === undefined) {
        // Do nothing if `declare x`
      } else if (def.append && isArrayOrObject(curr.value)) {
        // x+=y where x is an array or object
        if (isArrayOrObject(next.value)) {
          throw new ShError(`${next.varName}[0]: cannot assign list to array member`, 1);
        }
        next.value[0] += def.value;
      } else {
        this.assignVarDefault(next, def.value, def.integer);
        if (def.append) {// x+=y
          next.value = curr.value + next.value
        }
      }
    } else {
      next.value = def.value;
    }

    // Finally, adjust variable scope
    this.updateNestedVar(pid, def.varName, scopeIndex, next);
  }

  /**
   * Apply x=y (or x+=y) to process variable v
   * where x is `v.name` and y is `value`.
   */
  assignVarDefault(v: ProcessVar, value: any, integer?: boolean): void {
    switch (v.key) {
      case 'plain': {
        if (isArrayOrObject(v.value)) {
          if (isArrayOrObject(value)) {
            v.value = value;
          } else {
            v.value[0] = integer ? parseInt(value) || 0 : value;
          }
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

  createVar(def: AssignVarOpts): ProcessVar {
    const base = {
      key: 'plain' as 'plain',
      varName: def.varName,
      exported: !!def.exported,
      readonly: !!def.readonly,
    };

    if (def.shell) {
      if (def.index !== undefined) {
        if (def.value instanceof Array) {
          throw new ShError(`${def.varName}[${def.index}]: cannot assign list to array member`, 1);
        }
        return { ...base,
          value: Object.assign(
            def.associative ? {} : [],
            { [def.index]: def.integer ? parseInt(def.value) : def.value },
          ),
        };
      }
      // Standard case
      const value = def.integer && (
          def.value instanceof Array && def.value.map(Number)
          || (def.value && typeof def.value === 'object' && mapValues(def.value, Number))
        ) || def.value;
      return { ...base, value };
    } else {
      return { ...base, value: def.value };
    }
  }

  createVarProxy(pid: number) {
    return new Proxy({}, {
      get: (_, varName: string) =>
        varService.lookupVar(pid, varName),
      set: (_, varName: string, value) => {
        varService.assignVar(pid, { varName, value });
        return true;
      },
      ownKeys: () => {
        const { nestedVars } = processService.getProcess(pid);
        return Array.from(nestedVars.reduce((agg, scope) => {
          Object.keys(scope).forEach(key => agg.add(key));
          return agg;
        }, new Set<string>()));
      },
      getOwnPropertyDescriptor() {
        return { enumerable: true, configurable: true };
      },
    });
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
    throw Error(`positional variables not found in process ${pid}`);
  }

  private getProcess(pid: number): Process {
    return useStore.getState().proc[pid];
  }

  private getSession(sessionKey: string) {
    return useStore.getState().session[sessionKey];
  }

  toStringOrJson(input: any) {
    return typeof input === 'string'
      ? input
      : safeJsonStringify(input) || '';
  }

  getVarKeys(value: undefined | ProcessVar['value']): string[] {
    if (value && typeof value === 'object') {
      return Object.keys(value);
    }
    return [];
  }

  getVarValues(index: string | null, value: undefined | ProcessVar['value']): string[] {
    if (value == null) {
      // `undefined` means: never set
      // `null` means: declared but not set, or unset.
      return [];
    } else if (Array.isArray(value)) {
      // Must remove empties e.g. crashes getopts.
      return index === '@' || index === '*'
        ? (value as any[]).filter((x) => x !== undefined).map(this.toStringOrJson)
        : [this.toStringOrJson(value[index ? parseInt(index) : 0])];
    } else if (typeof value === 'object') {
      return index === '@' || index === '*'
        ? Object.values(value as Record<string, string | number>).map(this.toStringOrJson)
        : index === null
          ? [this.toStringOrJson(value)]
          : [this.toStringOrJson(value[index || 0])];
    }
    return [this.toStringOrJson(value)];
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

  popVarScope(pid: number) {
    this.getProcess(pid).nestedVars.shift();
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

  pushVarScope(pid: number, subshell = false) {
    this.getProcess(pid).nestedVars.unshift(
      subshell ? { [this.subshellVarName]: this.subshellVar } : {}
    );
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

export const iteratorDelayVarName = '__ITER_DELAY__';

export const varService = new VarService;
