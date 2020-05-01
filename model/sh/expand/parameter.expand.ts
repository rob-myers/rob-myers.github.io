import globrex from 'globrex';
import { BaseExpandComposite, BaseExpandCompositeDef, } from './base-expand';
import { Term, ExpandComposite } from '@model/os/term.model';
import { testNever } from '@model/generic.model';
import { ExpandType, ParamType } from '../expand.model';
import { ArithmOpComposite } from '../composite/arithm-op.composite';
import { ObservedType } from '@os-service/term.service';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { osGetPositionalsThunk, osLookupVarThunk, osAssignVarThunk, osFindVarNamesThunk } from '@store/os/declare.os.duck';
import { osGetProcessThunk, osFindAncestralProcessThunk } from '@store/os/process.os.duck';
import { isInteractiveShell } from '@model/os/service/term.util';

export class ParameterExpand extends BaseExpandComposite<ExpandType.parameter> {

  public get children() {
    const { def } = this;
    const subTerms = [] as (Term | undefined | null)[];

    switch (def.expandKey) {
      case 'parameter': {
        subTerms.push(def.index);// Include index if present.
        switch (def.parKey) {
          case ParamType.case: subTerms.push(def.pattern); break;
          case ParamType.default: subTerms.push(def.alt); break;
          case ParamType.keys:
          case ParamType.length:
          case ParamType.plain:
          case ParamType.pointer:
          case ParamType.position:
            break;
          case ParamType.remove: subTerms.push(def.pattern); break;
          case ParamType.replace: subTerms.push(def.orig, def.with); break;
          case ParamType.special: break;
          case ParamType.substring: subTerms.push(def.from, def.length); break;
          case ParamType.vars: break;
          default: throw testNever(def);
        }
        break;
      }
    }
    return subTerms.filter(Boolean) as Term[];
  }

  constructor(public def: ParameterExpandDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const base = { dispatch, processKey };

    if (this.def.index) {// Evaluate index if present.
      yield* this.runChild({ child: this.def.index, ...base });
    }
    /**
     * special parameters.
     */
    if (this.def.parKey === ParamType.special) {
      switch (this.def.param) {
        case '@':
        case '*':
        case '#': {
          // Restrict to positive positionals.
          const result = dispatch(osGetPositionalsThunk({ processKey }));
          const posPositionals = result.slice(1);
          
          switch (this.def.param) {
            case '@': this.values = posPositionals; break;
            case '*': this.value = posPositionals.join(' '); break;
            case '#': this.value = String(posPositionals.length); break;
            default: throw testNever(this.def.param);
          }
          break;
        }
        case '?':
        case '-':
        case '$':
        case '!': {
          const process = dispatch(osGetProcessThunk({ processKey }));

          switch (this.def.param) {
            case '?': this.value = String(process.lastExitCode || 0); break;
            // TODO opt flags from set?
            case '-': {
              this.value = '';
              break;
            }
            case '$': {
              if (isInteractiveShell(process.term)) {
                this.value = process.pid.toString();
              } else {
                const ancestralProc = dispatch(osFindAncestralProcessThunk({ processKey, predicate: ({ term }) => isInteractiveShell(term) }));
                this.value = (ancestralProc?.pid || process.pid).toString();
              }
              break;
            }
            case '!': {
              this.value = '';
              if (process.lastBgKey) {
                const bgProc = dispatch(osGetProcessThunk({ processKey: process.lastBgKey }));
                // Only provide PID if background process still exists
                bgProc && (this.value = bgProc.pid.toString());
              }
              break;
            }
            default: throw testNever(this.def.param);
          }
          break;
        }
        case '0': {
          this.value = dispatch(osGetPositionalsThunk({ processKey }))[0];
          break;
        }
        case '_': {
          /**
           * _TODO_
           * At shell startup, set to the absolute pathname used to invoke the shell
           * or shell script being executed as passed in the environment or argument list.
           * Subsequently, expands to the last argument to the previous command, after expansion.
           * Also set to the full pathname used to invoke each command executed and placed in
           * the environment exported to that command. When checking mail, this parameter holds
           * the name of the mail file.
           */
          this.value = '/bin/bash';
          break;
        }
        default: throw testNever(this.def.param);
      }
      yield this.exit(0);
      return;
    }
    
    /**
     * other parameters.
     */
    const index = this.def.index ? String(this.def.index.value) : null;
    const varValue = dispatch(osLookupVarThunk({ processKey, varName: this.def.param }));
    const paramValues = this.getVarValues(index, varValue);

    switch (this.def.parKey) {
      /**
       * case: ${x^y}, ${x^^y}, ${x,y} or ${x,,y}.
       * also e.g. ${x[1]^^}.
       */
      case ParamType.case: {
        const { all, to, pattern } = this.def;
        let re = /^.$/;// Pattern defaults to '?'.

        if (pattern) {// Evaluate pattern, convert to RegExp.
          yield* this.runChild({ child: pattern, ...base });
          re = globrex(pattern.value, { extended: true }).regex;
          // console.log({ re });
        }
        // Transform chars of each word.
        const tr = to === 'lower' ? (x: string) => x.toLowerCase() : (x: string) => x.toUpperCase();
        const text = paramValues.join('');
        this.value = all
          ? text.split('').map((c) => re.test(c) ? tr(c) : c).join('')
          : (re.test(text[0]) ? tr(text[0]) : text[0]) + text.slice(1);
        break;
      }
      /**
       * default: ${x[:][-=?+]y} or ${x[0]:-foo}.
       */
      case ParamType.default: {
        const { alt, colon, symbol } = this.def;
        // If colon then applies if 'unset', or 'null' (i.e. empty-string).
        // Otherwise, only applies if unset.
        const applies = colon
          ? !paramValues.length || (paramValues.length === 1 && paramValues[0] === '')
          : !paramValues.length;

        switch (symbol) {
          case '-':
          case '=': {
            if (applies) {
              if (!alt) {
                this.value = '';
              } else {
                yield* this.runChild({ child: alt, ...base });
                this.value = alt.value; 
              }
              if (symbol === '=') {
                // Additionally assign to param.
                dispatch(osAssignVarThunk({
                  processKey,
                  varName: this.def.param,
                  act: { key: 'default', value: paramValues.join('') },
                }));
              }
            } else {
              this.value = paramValues.join('');
            }
            break;
          }
          case '?': {
            if (applies) {
              if (!alt) {
                yield this.exit(1, `${this.def.param}: required but unset or null.`);
              } else {
                yield* this.runChild({ child: alt, ...base });
                yield this.exit(1, alt.value);
              }
            } else {
              this.value = paramValues.join('');
            }
            break;
          }
          case '+': {
            if (applies || !alt) {
              this.value = '';
            } else {// Use alt.
              yield* this.runChild({ child: alt, ...base });
              this.value = alt.value;
            }
            break;
          }
          default: throw testNever(symbol);
        }
        break;
      }
      /**
       * keys: ${!x[@]} or ${!x[*]}.
       */
      case ParamType.keys: {
        const keys = this.getVarKeys(varValue);
        if (this.def.split) {
          this.values = keys;
        } else {
          this.value = keys.join(' ');
        }
        break;
      }
      /**
       * length: ${#x}, ${#x[i]}, ${#x[@]} or ${#x[*]}.
       */
      case ParamType.length: {
        const { of: Of } = this.def;
        if (Of === 'word') {
          // `paramValues` should be [] or ['foo'].
          this.value = String((paramValues[0] || '').length);
        } else {// of: 'values'.
          this.value = String(paramValues.length);
        }
        break;
      }
      /**
       * plain: ${x}, ${x[i]}, ${x[@]} or ${x[*]}.
       */
      case ParamType.plain: {
        // "${x[@]}" can produce multiple fields, so
        // cannot set this.value as plains.join(' ').
        if (index === '@') {
          this.values = paramValues;
        } else if (index === '*') {
          this.value = paramValues.join(' ');
        } else {
          this.value = paramValues.join('');
        }
        break;
      }
      /**
       * pointer: ${!x} -- only basic support.
       */
      // /([a-z_][a-z0-9_])\[([a-z0-9_@*])+\]*/i
      case ParamType.pointer: {
        const nextParam = paramValues.join('');
        if (nextParam) {
          /**
           * Lookup param value without dynamic parsing.
           * Bash supports x='y[$z]'; echo ${!x};.
           * In particular, cannot point to array item.
           */
          const result = dispatch(osLookupVarThunk({ processKey, varName: nextParam }));
          this.value = this.getVarValues(null, result).join('');
        } else {
          this.value = '';
        }
        break;
      }
      /**
       * positional: $1, $2, etc.
       */
      case ParamType.position: {
        this.value = paramValues.join('');
        break;
      }
      /**
       * remove:
       *   prefix: ${x#y} or ${x##y}.
       *   suffix: ${x%y} or ${x%%y}.
       */
      case ParamType.remove: {
        const { dir, greedy } = this.def;

        if (this.def.pattern) {
          // Evaluate pattern, convert to RegExp.
          const { pattern } = this.def;
          yield* this.runChild({ child: pattern, ...base });
          const baseRe = (globrex(pattern.value, { extended: true }).regex as RegExp)
            .source.slice(1, -1);// Sans ^ and $.
          // Match largest/smallest prefix/suffix.
          const regex = new RegExp(dir === 1
            ? (greedy ? `^${baseRe}.*` : `^${baseRe}.*?`)
            : (greedy ? `.*${baseRe}$` : `.*?${baseRe}$`));
          // Remove matching.
          this.value = paramValues.join('').replace(regex, '');
        }
        break;
      }
      /**
       * replace: ${parameter/pattern/string}.
       * We support 'replace all' via //.
       * TODO support # (prefix), % (suffix).
       */
      case ParamType.replace: {
        const { all, orig, with: With } = this.def;
        yield* this.runChild({ child: orig, ...base });
        if (With) {
          yield* this.runChild({ child: With, ...base });
        }
        const subst = With ? With.value : '';
        const regex = new RegExp(orig.value, all ? 'g' : '');
        this.value = paramValues.join('').replace(regex, subst);
        break;
      }
      /**
       * substring:
       * ${parameter:offset} e.g. ${x: -7} or
       * ${parameter:offset:length}.
       * Also ${@:i:j}, ${x[@]:i:j} or ${x[*]:i:j}.
       */
      case ParamType.substring: {
        const { from, length } = this.def;
        yield* this.runChild({ child: from, ...base });
        const offset = parseInt(String(from.value)) || 0;

        if (length) {
          yield* this.runChild({ child: length, ...base });
        }
        const len = length
          ? parseInt(String(length.value)) || 0
          : paramValues.join(' ').length;// ?

        if (this.def.param === '@' || this.def.param === '*') {
          if (len < 0) {
            yield this.exit(1, `${len}: substring expression < 0`);
          }
          const result = dispatch(osGetPositionalsThunk({ processKey }));
          const posPositionals = result.slice(1);
          const values = posPositionals.slice(offset, (offset + len) % len);
          this.values = this.def.param === '@' ? values : [values.join(' ')];

        } else if (index === '@' || index === '*') {
          if (len < 0) {
            yield this.exit(1, `${len}: substring expression < 0`);
          }
          const values = paramValues.slice(offset, offset + len);
          this.values = this.def.param === '@' ? values : [values.join(' ')];
        } else {
          this.value = len >= 0
            ? paramValues.join('').substr(offset, len)
            : paramValues.join('').slice(offset, len);
        }
        break;
      }
      /**
       * variables: ${!param*} or ${!param@}.
       */
      case ParamType.vars: {
        const { split, param } = this.def;
        if (param.length) {
          const result = dispatch(osFindVarNamesThunk({ processKey, varPrefix: param }));
          this.values = split ? result : [result.join(' ')];
        } else {
          this.value = '';
        }
        break;
      }
      default: throw testNever(this.def);
    }


  }
}

export type ParameterExpandDef = (
  & BaseExpandCompositeDef<ExpandType.parameter>
  & ParameterDef<ExpandComposite, ArithmOpComposite | ExpandComposite>
);

export type ParameterDef<WordType, OpType> = BaseParamDef<OpType> & (
  // Alphabetic case with letter pattern ${a^b}, ${a^^b}, ${a,b}, ${a,,b}.
  | { parKey: ParamType.case; pattern: null | WordType; to: 'upper' | 'lower'; all: boolean }
  // Default parameters.
  | { parKey: ParamType.default; alt: null | WordType; colon: boolean;
    symbol:
    | '+' // Use alternative.
    | '=' // Assign default.
    | '?' // indicate error.
    | '-';// Use default.
  }
  // Array keys ${!x[@]}, ${!x[*]}.
  | { parKey: ParamType.keys; split: boolean }
  // String length ${#x}, ${#x[i]}, ${#x[@]}
  | { parKey: ParamType.length; of: 'word' | 'values' }
  // Plain lookup ${x}, ${x[i]}, ${x[@]} or ${x[*]}
  | { parKey: ParamType.plain }
  // Indirection ${!x} or ${!x[y]}
  | { parKey: ParamType.pointer }
  // Positional $1, $2, ..., ${10}, ...
  | { parKey: ParamType.position }// param: 0 | 1 | 2 | ...
  // Remove pre/suffix ${x#y}, ${x##y}, ${x%%y}, ${x%y}
  | { parKey: ParamType.remove; pattern: null | WordType; dir: 1 | -1; greedy: boolean }
  // ${x/y/z}, ${x//y/z}, ${x[i]/y/z} // TODO one arg?
  | { parKey: ParamType.replace; orig: WordType; with: null | WordType; all: boolean }
  // Special $@ | $* | ...
  | { parKey: ParamType.special;
    // Removed '#@' and '#*'.
    param: '@' | '*' | '#' | '?' | '-' | '$' | '!' | '0' | '_'; }
  // Substring ${x:y:z}, ${x[i]:y:z}
  | { parKey: ParamType.substring; from: OpType; length: null | OpType }
  // Vars with given non-empty prefix ${!prefix*} or ${!prefix@}
  | { parKey: ParamType.vars; split: boolean }
)

export interface BaseParamDef<OpType> {
  // parKey: ParamType;
  /** Parameter name. */
  param: string;
  /** $a instead of ${a}. No default. */
  short?: boolean;
  /** Exists <=> accessing array/map item. */
  index?: OpType;
}
