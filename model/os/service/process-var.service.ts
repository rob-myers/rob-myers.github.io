import { ProcessVar, VarFlags, PositionalProcVar } from '@model/os/process.model';
import { testNever, mapValues, keys } from '@model/generic.model';
import { AssignVarThunkBase } from '@store/os/declare.os.duck';

export class ProcessVarService {
  /**
   * Apply x=y (or x+=y) to process variable v
   * where x is {v.name} and y is {value}.
   */
  public assignVarDefault(v: ProcessVar, value: string): void {
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
  public assignVarItem(
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

  public createVar(def: AssignVarThunkBase): ProcessVar {
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
    const base = {
      varName,
      ...flags,
    };
  
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

  /**
 * Given current variable type {prevKey} and whether desire integer-based,
 * return new type after assignment x=foo.
 */
  public getDefaultVarKey(
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

  public isVarKeyNumeric(
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

  public recastVar(
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

  public transformVar(
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
  
}

export function cloneVar(input: ProcessVar): ProcessVar {
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

/**
 * Not in service because used by a synchronous action.
 */
export function createPositional(
  index: number,
  value: string,
  exported = false,
): PositionalProcVar {
  return {
    key: 'positional',
    index,
    varName: `${index}`,
    value,
    exported,
    readonly: true,
    to: null,
  };
}

export type DeclareOpt = (
  | ProcVarDisplayOpt
  | ProcVarExtraOpt
  | ProcVarPredicate
);

export enum ProcVarDisplayOpt {
  /** Restrict action/display to function names and definitions. */
  f= 'f',
  /** Restrict display to function names only (plus line number and source file when debugging). */
  F= 'F',
  /** Create global variables when used in a shell function; otherwise ignored. */
  g= 'g',
  /** Display the attributes and value of each NAME. */
  p= 'p',
}

export enum ProcVarExtraOpt  {
  /** `export`: remove the export property from each NAME. */
  n= 'n',
  /** `unset`: treat each NAME as a shell variable */
  v= 'v',
}
export const procVarExtraOpts = keys(ProcVarExtraOpt);

/**
 * A property of process variable.
 */
export enum ProcVarPredicate {
  /** Array. */
  a= 'a',
  /** Associative array. */
  A= 'A',
  /** Integer-valued. */
  i= 'i',
  /** Lowercase on assign. */
  l= 'l',
  /** Readonly. */
  r= 'r',
  /** Exported. */
  x= 'x',
  /** Uppercase on assign. */
  u= 'u',
}
export const procVarPredicates = keys(ProcVarPredicate);

export function isDeclareOpt(x: string): x is DeclareOpt {
  return (x in ProcVarDisplayOpt)
    || (x in ProcVarExtraOpt)
    || (x in ProcVarPredicate);
}

/**
 * Infer -i via type of variable i.e. integer-based?
 * {declare +i} must recast.
 */
export function getVarPredicates(v: ProcessVar): ProcVarPredicate[] {
  const output = [] as ProcVarPredicate[];

  switch (v.key) {
    case 'integer[]': output.push(ProcVarPredicate.a, ProcVarPredicate.i); break;
    case 'string[]': output.push(ProcVarPredicate.a); break;
    case 'to-integer': output.push(ProcVarPredicate.A, ProcVarPredicate.i); break;
    case 'to-string': output.push(ProcVarPredicate.A); break;
    case 'unset':
    case 'string':
    case 'positional':
      break;
    case 'integer': output.push(ProcVarPredicate.i); break;
    default: throw testNever(v);
  }
  v.readonly && output.push(ProcVarPredicate.r);
  v.exported && output.push(ProcVarPredicate.x);
  (v.to === 'lower') && output.push(ProcVarPredicate.l);
  (v.to === 'upper') && output.push(ProcVarPredicate.u);
  return output;
}

export function printVar(v: ProcessVar): string {
  switch (v.key) {
    case 'integer[]':
    case 'string[]':
    case 'to-integer':
    case 'to-string': {
      const lookup = v.value as Record<string, string>;
      if (lookup) {
        return `(${Object.keys(lookup).map((i) =>
          `[${i}]=${escapeVarString(lookup[i])}`)
          .join(' ')
        })`;
      }
      return '';
    }
    case 'unset':
      return '';
    case 'string':
    case 'positional':
      return v.value ? escapeVarString(v.value) : '';
    case 'integer':
      return String(v.value || 0);
    default:
      throw testNever(v);
  }
}

export function escapeVarString(value: string): string {
  const escaped = JSON.stringify(value).slice(1, -1)
    // '\u001b' -> '\x1b', former introduced via 'single-quote'.
    .replace(/(^|[^\\])\\u001b/g, '$1\\x1b');
  return escaped === value ? value : `$'${escaped}'`;
}
