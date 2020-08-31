import { Observable, from, of, lastValueFrom } from 'rxjs';
import { concatMap, reduce, tap, map, mergeMap, } from 'rxjs/operators';
import globrex from 'globrex';

import { awaitEnd } from '@model/rxjs/rxjs.util';
import * as Sh from '@model/shell/parse.service';
import { testNever } from '@model/generic.model';
import { ProcessAct, Expanded, act, ArrayAssign } from './process.model';
import { expandService as expand } from './expand.service';
import { ParamType, ParameterDef } from './parameter.model';
import { varService as vs } from './var.service';
import { processService as ps } from './process.service';
import { BaseAssignOpts } from './var.model';

type Obs = Observable<ProcessAct>;

class TranspileShService {

  transpile(parsed: Sh.File): Obs {
    const transpiled = this.File(parsed);
    console.log('TRANSPILED', transpiled); // DEBUG
    return transpiled;
  }

  /**
   * $(( x * y ))
   * $(( 2 * (x + 1) )),
   * (( x++ ))
   * x[1 + "2$i"]=y.
   */
  private ArithmExpr(input: Sh.ArithmExpr): Observable<Expanded> {
    switch (input.type) {
      case 'BinaryArithm': {
        return new Observable();

        // return new ArithmOpComposite({
        //   key: CompositeType.arithm_op,
        //   symbol: input.Op, 
        //   cs: [this.ArithmExpr(input.X), this.ArithmExpr(input.Y)],
        //   postfix: false,
        // });
      }
      case 'ParenArithm': {
        return this.ArithmExpr(input.X);
      }
      case 'UnaryArithm': {
        return new Observable();
        // return new ArithmOpComposite({
        //   key: CompositeType.arithm_op,
        //   symbol: input.Op,
        //   cs: [this.ArithmExpr(input.X)],
        //   postfix: input.Post,
        // });
      }
      case 'Word': {
        return this.Expand(input);
      }
      default: throw testNever(input);
    }
  }

  private ArrayExpr(
    { Pos, End, Elems, Last, Lparen, Rparen }: Sh.ArrayExpr,
  ): Observable<ArrayAssign> {
    const pairs = Elems.map(({ Index, Value }) => ({
      key: Index ? this.ArithmExpr(Index) : null,
      value: this.Expand(Value),
    }));

    return of(null).pipe(
      mergeMap(async function* () {
        for (const { key, value } of pairs) {
          const keyResult = key ? await lastValueFrom(key) : null;
          const valueResult = await lastValueFrom(value);
          yield {
            key: keyResult?.values.join(' ') || null,
            value: valueResult.values.join(' '),
          };
        }
      }),
      reduce((agg, item) =>
        agg.pairs.concat(item) && agg, act.arrayAsgn([])),
    );
  }

  private Assign({ Name, Value, Append, Array: ArrayTerm, Index, Naked, meta }: Sh.Assign): Obs {
    const { pid } = meta
    const ts = this;
    const declOpts: Partial<BaseAssignOpts> = {}; // TODO
    const varName = Name.Value;

    if (ArrayTerm) {
      return of(null).pipe(
        mergeMap(async function* () {
          const { pairs } = await lastValueFrom(ts.ArrayExpr(ArrayTerm))

          if (declOpts.associative) {
            /**
             * Associative array via `declare -A`.
             * We also forward this.associative flag via `baseAssignOpts`.
             */
            const value = {} as Record<string, string>; // Even if integer-valued
            for (const { key, value: v } of pairs) {
              if (!key) {
                ps.warn(pid, `${varName}: ${v}: must use subscript when assigning associative array`);
              } else {
                value[key] = v;
              }
            }
            vs.assignVar(pid, { ...declOpts, varName, act: { key: 'map', value } });
          } else {
            /**
             * Vanilla array.
             */
            const values = [] as string[];
            let index = 0;
            pairs.map(({ key, value }) => {
              index = key ? (parseInt(key) || 0) : index; // ?
              values[index] = value;
              index++;
            });

            if (Append) {
              const prevValue = vs.lookupVar(pid, varName);
              Array.isArray(prevValue) && values.unshift(...(prevValue as any[]).map(String));
            }

            vs.assignVar(pid, { ...declOpts, varName, act: { key: 'array', value: values } });
          }
        })
      );
    } else if (Index) {
      return of(null).pipe(
        mergeMap(async function* () {
          // Run index
          const { values } = await lastValueFrom(ts.ArithmExpr(Index))
          const index = values.join(' ');
          /**
           * Unsure if naked is possible here.
           * If {x[i]=} then no def.value so use ''.
           */
          const value = Naked ? undefined
            : Value ? (await lastValueFrom(ts.Expand(Value))).values.join(' ')
            : '';

          vs.assignVar(pid, { ...declOpts, varName, act: { key: 'item', index, value } });
        }),
      );
    } else {
      /**
       * `x=foo`, and also `declare -a x` and `declare -a x=foo`
       */
      // NOTE this stream is actually empty
      return of(null).pipe(
        mergeMap(async function* () {
          /**
           * Naked if e.g. declare -i x.
           * We use undefined so we don't overwrite.
           */
          const value = Naked ? undefined
            : Value ? await lastValueFrom(ts.Expand(Value).pipe(
                reduce((agg, { values }) => agg.concat(values), [] as string[]),
                map((x) => x.join(' ')),
              ))
            : '';

          if (declOpts.array) {// declare -a x
            vs.assignVar(pid, { ...declOpts, varName, act: { key: 'array', value: value == null ? [] : [value] } });
          } else if (declOpts.associative) {// declare -A x
            vs.assignVar(pid, { ...declOpts, varName, act: { key: 'map', value: value == null ? {} : { 0: value } } });
          } else {// x=foo or x+=foo
            vs.assignVar(pid, {
              ...declOpts,
              varName,
              act: { key: 'default', value, append: Append },
            });
          }
        }),
      );
    }
  }

  private CallExpr(
    Cmd: null | Sh.CallExpr,
    extend: CommandExtension,
  ): Obs {
    const { Redirs, background, negated } = extend;

    if (Cmd) {
      const { Assigns, Args } = Cmd;
      const ts = this;

      return of(null).pipe(
        mergeMap(async function* () {

          // await lastValueFrom(from(Assigns).pipe(
          await awaitEnd(from(Assigns).pipe(
            concatMap(arg => ts.Assign(arg)),
          ));

          const args = Args.length
            ? await lastValueFrom(from(Args).pipe(
              concatMap(arg => ts.Expand(arg)),
              reduce((agg, { values }) => agg.concat(values), [] as string[]),
            )) : [];
          console.log({ args });

          return act.expanded([]);
        })
      );
      // return new SimpleComposite({
      //   key: CompositeType.simple,
      //   assigns: Assigns.map((assign) => this.Assign(assign)),
      //   redirects: Redirs.map((redirect) => this.Redirect(redirect)),
      //   words: Args.map((arg) => this.Expand(arg)),
      //   comments,
      //   background,
      //   negated,
      //   sourceMap: this.sourceMap({ Pos, End },
      //     // i.e. Position of words, excluding assigns & redirects.
      //     { key: 'inner', pos: InnerPos, end: InnerEnd },
      //     ...extra,
      //   ),
      // });
    }
    /**
     * Redirects without command can have effects:
     * - > out # creates blank file out
     * - echo "$( < out)" # echos contents of out
     */
    return of(act.unimplemented());
    // return new SimpleComposite({
    //   key: CompositeType.simple,
    //   assigns: [],
    //   redirects: Redirs.map((redirect) => this.Redirect(redirect)),
    //   words: [],
    //   comments,
    //   background,
    //   negated,
    //   sourceMap: Redirs.length
    //     ? this.sourceMap({ Pos: Redirs[0].Pos, End: (last(Redirs) as Sh.Redirect).End })
    //     : undefined,
    // });
  }


  /**
   * Construct a simple command (CallExpr), or compound command.
   */
  private Command(
    Cmd: null | Sh.Command,
    extend: CommandExtension,
  ): Obs {
    if (!Cmd || Cmd.type === 'CallExpr') {
      return this.CallExpr(Cmd, extend);
    }

    return of(act.unimplemented());

    // let child: Term = null as any;

    // switch (Cmd.type) {
    //   case 'ArithmCmd': child = this.ArithmCmd(Cmd); break;
    //   case 'BinaryCmd': child = this.BinaryCmd(Cmd); break;
    //   case 'Block': child = this.Block(Cmd); break;
    //   case 'CaseClause': child = this.CaseClause(Cmd); break;
    //   case 'CoprocClause': {
    //     /**
    //      * TODO
    //      */
    //     child = this.CoprocClause(Cmd);
    //     break;
    //   }
    //   case 'DeclClause': child = this.DeclClause(Cmd); break;
    //   case 'ForClause': child = this.ForClause(Cmd); break;
    //   case 'FuncDecl': child = this.FuncDecl(Cmd); break;
    //   case 'IfClause': child = this.IfClause(Cmd); break;
    //   case 'LetClause': child = this.LetClause(Cmd); break;
    //   case 'Subshell': child = this.Subshell(Cmd); break;
    //   case 'TestClause': child = this.TestClause(Cmd); break;
    //   case 'TimeClause': child = this.TimeClause(Cmd); break;
    //   case 'WhileClause': child = this.WhileClause(Cmd); break;
    //   default: throw testNever(Cmd);
    // }

    // const { Redirs, background, negated } = extend;

    // return new CompoundComposite({// Compound command.
    //   key: CompositeType.compound,
    //   child,
    //   redirects: Redirs.map((x) => this.Redirect(x)),
    //   background,
    //   negated,
    // });
  }

  private Expand({ Parts }: Sh.Word): Observable<Expanded> {
    /**
     * TODO
     * - expand parts in sequence, forwarding messages
     * - aggregate their output via `reduce`, compute values
     * - emit transform as same message type for later processing
     */
    if (Parts.length > 1) {
      return from(Parts).pipe(
        concatMap(wordPart => this.ExpandPart(wordPart)),
        reduce(({ values }, item: Expanded) =>
          act.expanded(values.concat(item.values)),
          act.expanded([]),
        ),
        tap((msg) => {
          console.log('aggregated', msg);
        }),
        /**
         * TODO apply complex composition and emit
         */
      );
    }
    return this.ExpandPart(Parts[0]);
  }

  private ExpandPart(input: Sh.WordPart): Observable<Expanded> {
    switch (input.type) {
      // case 'ArithmExp': {
      //   return new ArithmExpand({
      //     key: CompositeType.expand,
      //     expandKey: ExpandType.arithmetic,
      //     expr: this.ArithmExpr(input.X),
      //     sourceMap: this.sourceMap({ Pos, End }),
      //   });
      // }
      // case 'CmdSubst': {
      //   const { Pos, End, StmtList, Left, Right } = input;
      //   return new CommandExpand({
      //     key: CompositeType.expand,
      //     expandKey: ExpandType.command,
      //     cs: StmtList.Stmts.map((Stmt) => this.Stmt(Stmt)),
      //     sourceMap: this.sourceMap({ Pos, End },
      //       // $( ... ) or ` ... `
      //       { key: 'brackets', pos: Left, end: Right }),
      //     // Trailing comments only.
      //     comments: StmtList.Last.map<TermComment>(({ Hash, End, Text }) => ({
      //       sourceMap: this.sourceMap({ Pos: Hash, End }),
      //       text: Text,
      //     })),
      //   });
      // }
      // case 'DblQuoted': {
      //   const { Dollar, Parts } = input;
      //   return new DoubleQuoteExpand({
      //     key: CompositeType.expand,
      //     expandKey: ExpandType.doubleQuote,
      //     cs: Parts.map((part) => this.ExpandPart(part)),
      //     locale: Dollar,
      //     sourceMap: this.sourceMap({ Pos, End }),
      //     comments: [],
      //   });
      // }
      case 'ExtGlob': {
        return of(act.expanded([''])); // TODO
      }
      case 'Lit': {
        return of(act.expanded(expand.literal(input)));
      }
      case 'ParamExp': {
        return this.ParamExp(input);
      }
      // case 'ProcSubst': {
      //   const { Pos, End, StmtList, Op, Rparen } = input;
      //   return new ProcessExpand({
      //     key: CompositeType.expand,
      //     expandKey: ExpandType.process,
      //     dir: Op === '<(' ? '<' : '>',
      //     cs: StmtList.Stmts.map((Stmt) => this.Stmt(Stmt)),
      //     sourceMap: this.sourceMap({ Pos, End },
      //       { key: 'right-bracket', pos: Rparen }),
      //     // Trailing comments only.
      //     comments: StmtList.Last.map<TermComment>(({ Hash, End, Text }) => ({
      //       sourceMap: this.sourceMap({ Pos: Hash, End }),
      //       text: Text,
      //     })),
      //   });
      // }
      case 'SglQuoted': {
        return of(act.expanded(expand.singleQuotes(input)));
      }
      // default: throw testNever(input);
      default:
        throw Error(`${input.type} unimplemented`);
    }
  }

  private File({ StmtList }: Sh.File): Obs {
    return from(StmtList.Stmts).pipe(
      concatMap(x => this.Stmt(x)),
    );
  }

  private Stmt({ Negated, Background, Redirs, Cmd }: Sh.Stmt): Obs {
    return this.Command(Cmd, {
      Redirs,
      background: Background,
      negated: Negated,
    });
  }

  private ParamExp(input: Sh.ParamExp): Observable<Expanded> {
    const def = this.toParamDef(input);
    const { pid } = input.meta;
    // console.log({ paramExp: input, def });

    if (def.parKey === ParamType.special) {
      /**
       * Special parameters.
       */
      return from(function* () {
        switch (def.param) {
          case '@':
          case '*':
          case '#': {
            // Restrict to positive positionals
            const result = vs.getPositionals(pid);
            const posPositionals = result.slice(1);
            
            switch (def.param) {
              case '@': yield act.expanded(posPositionals); break;
              case '*': yield act.expanded(posPositionals.join(' ')); break;
              case '#': yield act.expanded(String(posPositionals.length)); break;
              default: throw testNever(def.param);
            }
            break;
          }
          case '?':
          case '-':
          case '$':
          case '!': {
            const process = ps.getProcess(pid);

            switch (def.param) {
              case '?':
                yield act.expanded(String(process.lastExitCode || 0));
                break;
              case '-': {// TODO opt flags from set?
                yield act.expanded('');
                break;
              }
              case '$': {
                if (ps.isInteractiveShell(process.parsed)) {
                  yield act.expanded(`${pid}`);
                } else {
                  const ancestralProc = ps.findAncestral(pid, ({ parsed }) => ps.isInteractiveShell(parsed))
                  yield act.expanded((ancestralProc!.pid).toString()); // Top-most process is session's shell
                }
                break;
              }
              case '!': {
                if (process.lastBgPid && ps.getProcess(process.lastBgPid)) {
                  yield act.expanded(`${process.lastBgPid}`);
                  break;
                }
                yield act.expanded(''); // Fallback
                break;
              }
              default: throw testNever(def.param);
            }
            break;
          }
          case '0': {
            yield act.expanded(vs.getPositionals(pid)[0]);
            break;
          }
          case '_': {
            yield act.expanded('/bin/bash'); // TODO
            break;
          }
          default: throw testNever(def.param);
        }
      }());
    };

    /**
     * other parameters.
     */
    return (def.index || of(act.expanded([]))).pipe(
      mergeMap(async function* ({ values }) {
        const index = def.index ? `${values}` : null;
        const varValue = vs.lookupVar(pid, def.param);
        const paramValues = vs.getVarValues(index, varValue);

        switch (def.parKey) {
          /**
           * case: ${x^y}, ${x^^y}, ${x,y} or ${x,,y}.
           * - also e.g. ${x[1]^^}.
           */
          case ParamType.case: {
            const { all, to, pattern } = def;
            let re = /^.$/;// Pattern defaults to '?'.

            /**
             * TODO set a variable first
             */
            console.log({ case: def, varValue, paramValues });
    
            if (pattern) {
              // Evaluate pattern and convert to RegExp
              const values = await lastValueFrom(pattern.pipe(
                reduce((agg, item) => (agg.concat(item.values)), [] as string[]),
              ));
              re = globrex(values.join(' '), { extended: true }).regex;
            }

            // Transform chars of each word.
            const transform = to === 'lower'
              ? (x: string) => x.toLowerCase()
              : (x: string) => x.toUpperCase();
            const text = paramValues.join('');
            const output = all
              ? text.split('').map((c) => re.test(c) ? transform(c) : c).join('')
              : (re.test(text[0]) ? transform(text[0]) : text[0]) + text.slice(1);
            yield act.expanded(output);
            break;
          }
          /**
           * default: ${x[:][-=?+]y} or ${x[0]:-foo}.
           */
          // case ParamType.default: {
          //   const { alt, colon, symbol } = def;
          //   // If colon then applies if 'unset', or 'null' (i.e. empty-string).
          //   // Otherwise, only applies if unset.
          //   const applies = colon
          //     ? !paramValues.length || (paramValues.length === 1 && paramValues[0] === '')
          //     : !paramValues.length;
    
          //   switch (symbol) {
          //     case '-':
          //     case '=': {
          //       if (applies) {
          //         if (!alt) {
          //           this.value = '';
          //         } else {
          //           yield* this.runChild({ child: alt, ...base });
          //           this.value = alt.value; 
          //         }
          //         if (symbol === '=') {
          //           // Additionally assign to param.
          //           dispatch(osAssignVarThunk({
          //             processKey,
          //             varName: def.param,
          //             act: { key: 'default', value: paramValues.join('') },
          //           }));
          //         }
          //       } else {
          //         this.value = paramValues.join('');
          //       }
          //       break;
          //     }
          //     case '?': {
          //       if (applies) {
          //         if (!alt) {
          //           yield this.exit(1, `${def.param}: required but unset or null.`);
          //         } else {
          //           yield* this.runChild({ child: alt, ...base });
          //           yield this.exit(1, alt.value);
          //         }
          //       } else {
          //         this.value = paramValues.join('');
          //       }
          //       break;
          //     }
          //     case '+': {
          //       if (applies || !alt) {
          //         this.value = '';
          //       } else {// Use alt.
          //         yield* this.runChild({ child: alt, ...base });
          //         this.value = alt.value;
          //       }
          //       break;
          //     }
          //     default: throw testNever(symbol);
          //   }
          //   break;
          // }
          // /**
          //  * keys: ${!x[@]} or ${!x[*]}.
          //  */
          // case ParamType.keys: {
          //   const keys = this.getVarKeys(varValue);
          //   if (def.split) {
          //     this.values = keys;
          //   } else {
          //     this.value = keys.join(' ');
          //   }
          //   break;
          // }
          // /**
          //  * length: ${#x}, ${#x[i]}, ${#x[@]} or ${#x[*]}.
          //  */
          // case ParamType.length: {
          //   const { of: Of } = def;
          //   if (Of === 'word') {
          //     // `paramValues` should be [] or ['foo'].
          //     this.value = String((paramValues[0] || '').length);
          //   } else {// of: 'values'.
          //     this.value = String(paramValues.length);
          //   }
          //   break;
          // }
          /**
           * plain: ${x}, ${x[i]}, ${x[@]} or ${x[*]}.
           */
          case ParamType.plain: {
            // "${x[@]}" can produce multiple fields, so
            // cannot set this.value as plains.join(' ').
            if (index === '@') {
              yield act.expanded(paramValues);
            } else if (index === '*') {
              yield act.expanded(paramValues.join(' '));
            } else {
              yield act.expanded(paramValues.join(''));
            }
            break;
          }
          // /**
          //  * pointer: ${!x} -- only basic support.
          //  */
          // // /([a-z_][a-z0-9_])\[([a-z0-9_@*])+\]*/i
          // case ParamType.pointer: {
          //   const nextParam = paramValues.join('');
          //   if (nextParam) {
          //     /**
          //      * Lookup param value without dynamic parsing.
          //      * Bash supports x='y[$z]'; echo ${!x};.
          //      * In particular, cannot point to array item.
          //      */
          //     const result = dispatch(osLookupVarThunk({ processKey, varName: nextParam }));
          //     this.value = this.getVarValues(null, result).join('');
          //   } else {
          //     this.value = '';
          //   }
          //   break;
          // }
          // /**
          //  * positional: $1, $2, etc.
          //  */
          // case ParamType.position: {
          //   this.value = paramValues.join('');
          //   break;
          // }
          // /**
          //  * remove:
          //  *   prefix: ${x#y} or ${x##y}.
          //  *   suffix: ${x%y} or ${x%%y}.
          //  */
          // case ParamType.remove: {
          //   const { dir, greedy } = def;
    
          //   if (def.pattern) {
          //     // Evaluate pattern, convert to RegExp.
          //     const { pattern } = def;
          //     yield* this.runChild({ child: pattern, ...base });
          //     const baseRe = (globrex(pattern.value, { extended: true }).regex as RegExp)
          //       .source.slice(1, -1);// Sans ^ and $.
          //     // Match largest/smallest prefix/suffix.
          //     const regex = new RegExp(dir === 1
          //       ? (greedy ? `^${baseRe}.*` : `^${baseRe}.*?`)
          //       : (greedy ? `.*${baseRe}$` : `.*?${baseRe}$`));
          //     // Remove matching.
          //     this.value = paramValues.join('').replace(regex, '');
          //   }
          //   break;
          // }
          // /**
          //  * replace: ${parameter/pattern/string}.
          //  * We support 'replace all' via //.
          //  * TODO support # (prefix), % (suffix).
          //  */
          // case ParamType.replace: {
          //   const { all, orig, with: With } = def;
          //   yield* this.runChild({ child: orig, ...base });
          //   if (With) {
          //     yield* this.runChild({ child: With, ...base });
          //   }
          //   const subst = With ? With.value : '';
          //   const regex = new RegExp(orig.value, all ? 'g' : '');
          //   this.value = paramValues.join('').replace(regex, subst);
          //   break;
          // }
          // /**
          //  * substring:
          //  * ${parameter:offset} e.g. ${x: -7}.
          //  * ${parameter:offset:length}.
          //  * Also ${@:i:j}, ${x[@]:i:j} or ${x[*]:i:j}.
          //  */
          // case ParamType.substring: {
          //   const { from, length } = def;
          //   yield* this.runChild({ child: from, ...base });
          //   const offset = parseInt(String(from.value)) || 0;
    
          //   if (length) {
          //     yield* this.runChild({ child: length, ...base });
          //   }
    
          //   const len = length
          //     ? parseInt(String(length.value)) || 0
          //     : paramValues.join(' ').length;
    
          //   if (def.param === '@' || def.param === '*') {
          //     if (len < 0) {
          //       yield this.exit(1, `${len}: substring expression < 0`);
          //     }
          //     const positionals = dispatch(osGetPositionalsThunk({ processKey })).slice();
          //     const values = from
          //       ? length
          //         ? positionals.slice(offset, offset + len)
          //         : positionals.slice(offset)
          //       : positionals.slice(1); // positive positionals
          //     this.values = def.param === '@' ? values : [values.join(' ')];
          //   } else if (index === '@' || index === '*') {
          //     if (len < 0) {
          //       yield this.exit(1, `${len}: substring expression < 0`);
          //     }
          //     const values = paramValues.slice(offset, offset + len);
          //     this.values = def.param === '@' ? values : [values.join(' ')];
          //   } else {
          //     this.value = len >= 0
          //       ? paramValues.join('').substr(offset, len)
          //       : paramValues.join('').slice(offset, len);
          //   }
          //   break;
          // }
          // /**
          //  * variables: ${!param*} or ${!param@}.
          //  */
          // case ParamType.vars: {
          //   const { split, param } = def;
          //   if (param.length) {
          //     const result = dispatch(osFindVarNamesThunk({ processKey, varPrefix: param }));
          //     this.values = split ? result : [result.join(' ')];
          //   } else {
          //     this.value = '';
          //   }
          //   break;
          // }
          // default: throw testNever(def);
        }
        return act.expanded([]); 
      }),
    );
  }

  private isArithmExprSpecial(arithmExpr: null | Sh.ArithmExpr): null | '@' | '*' {
    if (
      arithmExpr && arithmExpr.type === 'Word'
      && (arithmExpr.Parts.length === 1)
      && arithmExpr.Parts[0].type === 'Lit'
    ) {
      const { Value } = arithmExpr.Parts[0] as Sh.Lit;
      if (Value === '@') {
        return '@';
      } else if (Value === '*') {
        return '*';
      }
    }
    return null;
  }

  private toParamDef({
    Excl, Exp, Index, Length, Names, Param, Repl, Short, Slice,
  }: Sh.ParamExp) {
    let def = null as null | ParameterDef<Observable<Expanded>, Observable<Expanded>>;
    const base = {
      param: Param.Value,
      short: Short,
      index: Index ? this.ArithmExpr(Index) : undefined,
    };
  
    if (Excl) {// ${!...}
      if (Index) {
        const special = this.isArithmExprSpecial(Index);
        if (special) {// ${!x[@]}, ${x[*]}
          def = { ...base, parKey: ParamType['keys'], split: special === '@' };
        } else {// Indirection ${!x[n]} or ${!x["foo"]}
          def = def || { ...base, parKey: ParamType['pointer'] };
        }
      } else if (Names) {// ${!x*}, ${!x@}
        def = { ...base, parKey: ParamType['vars'], split: (Names === '@') };
      } else {// Indirection ${!x}
        def = { ...base, parKey: ParamType['pointer'] };
      }
    } else {// No exclamation
      if (Exp) {
        const pattern = Exp.Word ? this.Expand(Exp.Word) : null;
        const alt = pattern;
        switch (Exp.Op) {
          case '^': def = { ...base, parKey: ParamType.case, pattern, to: 'upper', all: false }; break;
          case '^^': def = { ...base, parKey: ParamType.case, pattern, to: 'upper', all: true };  break;
          case ',': def = { ...base, parKey: ParamType.case, pattern, to: 'lower', all: false }; break;
          case ',,': def = { ...base, parKey: ParamType.case, pattern, to: 'lower', all: true }; break;
          // remove
          case '%': def = { ...base, parKey: ParamType.remove, pattern, greedy: false, dir: 1 }; break;
          case '%%': def = { ...base, parKey: ParamType.remove, pattern, greedy: true, dir: 1 }; break;
          case '#': def = { ...base, parKey: ParamType.remove, pattern, greedy: false, dir: -1 }; break;
          case '##': def = { ...base, parKey: ParamType.remove, pattern, greedy: true, dir: -1 }; break;
          // default
          case '+': def = { ...base, parKey: ParamType.default, alt, symbol: '+', colon: false }; break;
          case ':+': def = { ...base, parKey: ParamType.default, alt, symbol: '+', colon: true }; break;
          case '=': def = { ...base, parKey: ParamType.default, alt, symbol: '=', colon: false }; break;
          case ':=': def = { ...base, parKey: ParamType.default, alt, symbol: '=', colon: true }; break;
          case '?': def = { ...base, parKey: ParamType.default, alt, symbol: '?', colon: false }; break;
          case ':?': def = { ...base, parKey: ParamType.default, alt, symbol: '?', colon: true }; break;
          case '-': def = { ...base, parKey: ParamType.default, alt, symbol: '-', colon: false }; break;
          case ':-': def = { ...base, parKey: ParamType.default, alt, symbol: '-', colon: true }; break;
          // ...
          default: throw new Error(
            `Unsupported operation '${Exp.Op}' in parameter expansion of '${Param.Value}'.`);
        }
      } else if (Length) {// ${#x}, ${#x[2]}, ${#x[@]}
        const isSpecial = Boolean(this.isArithmExprSpecial(Index));
        def = { ...base, parKey: ParamType['length'], of: isSpecial ? 'values' : 'word' };
      } else if (Repl) {// ${x/y/z}, ${x//y/z}, ${x[foo]/y/z}
        def = { ...base, parKey: ParamType['replace'], all: Repl.All,
          orig: this.Expand(Repl.Orig),
          with: Repl.With ? this.Expand(Repl.With) : null,
        };
      } else if (Slice) {// ${x:y:z}, ${x[foo]:y:z}
        def = { ...base, parKey: ParamType['substring'],
          from: this.ArithmExpr(Slice.Offset),
          length: Slice.Length ? this.ArithmExpr(Slice.Length) : null,
        };
  
      } else if (Index) {// ${x[i]}, ${x[@]}, ${x[*]}
        // NOTE ${x[@]} can split fields in double quotes.
        def = { ...base, parKey: ParamType['plain'] };
      } else if (base.param === String(parseInt(base.param))) {
        def = { ...base, parKey: ParamType['position'] };
      } else {
        switch (base.param) {
          // special
          case '@':
          case '*':
          case '#':
          case '?':
          case '-':
          case '$':
          case '!':
          case '0':
          case '_': {
            def = { ...base, parKey: ParamType['special'], param: base.param };
            break;
          }// plain
          default: {
            def = { ...base, parKey: ParamType['plain'] };
          }
        }
      }
    }
    return def;
  }

}
interface CommandExtension {
  Redirs: Sh.Redirect[];
  background: boolean;
  negated: boolean;
}

export class ShError extends Error {
  constructor(
    message: string,
    public exitCode: number,
    public internalCode?: 'P_EXIST' | 'PP_NO_EXIST' | 'F_NO_EXIST' | 'NOT_A_DIR',
  ) {
    super(message);
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ShError.prototype);
  }
}

export const transpileSh = new TranspileShService;
