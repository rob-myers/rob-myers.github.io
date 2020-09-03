import { Observable, from, of, lastValueFrom, throwError } from 'rxjs';
import { concatMap, reduce, map, mergeMap, tap } from 'rxjs/operators';
import globrex from 'globrex';

import { awaitEnd } from '@model/rxjs/rxjs.util';
import * as Sh from '@model/shell/parse.service';
import { testNever, last } from '@model/generic.model';
import { FsFile } from '@store/shell.store';
import { ProcessAct, Expanded, act, ArrayAssign } from './process.model';
import { expandService as expand, expandService } from './expand.service';
import { ParamType, ParameterDef } from './parameter.model';
import { varService as vs } from './var.service';
import { processService as ps } from './process.service';
import { fileService as fs } from './file.service';
import { builtinService as bs } from './builtin.service';
import { NamedFunction } from './var.model';

class TranspileShService {

  transpile(parsed: Sh.File): Observable<ProcessAct> {
    const transpiled = this.File(parsed);
    console.log('TRANSPILED', transpiled);
    return transpiled;
  }

  /**
   * (( x = y / 2 , z = x * y ))
   */
  public ArithmCmd(node: Sh.ArithmCmd): Observable<Expanded> {    
    return of(null).pipe(
      mergeMap(async function* () {
        await ts.runArithmExpr(node.X);
        // Exit code 0 iff `input.number` is a non-zero integer
        if (node.number && Number.isInteger(node.number)) {
          node.exitCode = node.number ? 0 : 1;
        } else {
          node.exitCode = 1;
        }
        yield act.expanded(`${node.number || 0}`);
    }));
  }

  /**
   * y=$(( 2 ** x ))
   */
  ArithmExp(node: Sh.ArithmExp): Observable<Expanded> {
    return this.ArithmCmd(node as unknown as Sh.ArithmCmd);
  }

  /**
   * $(( x * y ))
   * $(( 2 * (x + 1) )),
   * (( x++ ))
   * x[1 + "2$i"]=y.
   */
  private ArithmExpr(node: Sh.ArithmExpr): Observable<Expanded> {
    const { pid } = node.meta;

    switch (node.type) {
      case 'BinaryArithm': {
        return of(null).pipe(
          mergeMap(async function* () {
            if (node.Op === '?') {
              /**
               * Ternary i.e. `x ? y : z`.
               */
              const [left, other] = [node.X, node.Y as Sh.BinaryArithm];
              await ts.runArithmExpr(left); // Mutates input.number
              const right = node.number ? other.X : other.Y;
              await ts.runArithmExpr(right);
            } else {
              /**
               * Binary.
               */
              const [left, right] = [node.X, node.Y];
              await ts.runArithmExpr(left);
              const lNum = node.number!
              const lStr = node.string!;
              await ts.runArithmExpr(right);
              const rNum = node.number!
  
              switch (node.Op) {
                case '<': node.number = (lNum < rNum) ? 1 : 0; break;
                case '<=': node.number = (lNum <= rNum) ? 1 : 0; break;
                case '>': node.number = (lNum > rNum) ? 1 : 0; break;
                case '>=': node.number = (lNum >= rNum) ? 1 : 0; break;
                case '*': node.number = lNum * rNum; break;
                case '**': node.number = Math.pow(lNum, rNum); break;
                case '==': node.number = (lNum === rNum) ? 1 : 0; break;
                case '+=':
                case '-=':
                case '*=':
                case '/=':
                case '%=':
                case '&=':
                case '|=':
                case '^=':
                case '<<=':
                case '>>=':
                {
                  switch (node.Op) {
                    case '+=': node.number = lNum + rNum; break;
                    case '-=': node.number = lNum - rNum; break;
                    case '*=': node.number = lNum * rNum; break;
                    case '/=': node.number = lNum / rNum; break;
                    case '%=': node.number = lNum % rNum; break;
                    case '&=': node.number = lNum & rNum; break;
                    case '|=': node.number = lNum | rNum; break;
                    case '^=': node.number = lNum ^ rNum; break;
                    case '<<=': node.number = lNum << rNum; break;
                    case '>>=': node.number = lNum >> rNum; break;
                    default: throw testNever(node.Op);
                  }
                  // Update variable
                  vs.assignVar(pid, {
                    integer: true,
                    varName: lStr,
                    act: { key: 'default', value: String(node.number) },
                  });
                  break;
                }
                case '+': node.number = lNum + rNum; break;
                case '-': node.number = lNum - rNum; break;
                // Ternary '?' handled earlier.
                // Also arises in test expressions.
                case '=': {// Assign.
                  node.number = rNum;
                  vs.assignVar(pid, {
                    integer: true,
                    varName: lStr,
                    act: { key: 'default', value: String(node.number) },
                  });                  
                  // true <=> assigned value non-zero.
                  // exitCode = Number.isInteger(this.value) && this.value ? 0 : 1;
                  break;
                }
                case '%': node.number = lNum % rNum; break;
                case '^': node.number = lNum ^ rNum; break;
                case ',': node.number = rNum; break;
                case '/': node.number = Math.floor(lNum / rNum); break;
                /**
                 * TODO
                 */
                default: {
                  // yield this.exit(2, `${def.symbol}: unrecognised binary arithmetic symbol`);
                  // return;
                  throw new ShError(`${node.Op}: unrecognised binary arithmetic symbol`, 2);
                }
              }
              node.exitCode = node.number ? 0 : 1;
            }
          }),
        );
      }
      case 'ParenArithm': {
        return this.ArithmExpr(node.X);
      }
      case 'UnaryArithm': {
        return of(null).pipe(
          mergeMap(async function* () {
            /**
             * Unary.
             */
            const child = node.X;
            await ts.runArithmExpr(child); // Mutates input.number
            const childNum = node.number!;
            const childStr = node.string!;

            switch (node.Op) {
              case '!': node.number = childNum ? 0 : 1; break;
              case '~': node.number = ~childNum; break;
              case '-': node.number = -childNum; break;
              case '+': node.number = childNum; break;
              case '++':
              case '--':
              {
                switch (node.Op) {
                  case '++': node.number = childNum + 1; break;
                  case '--': node.number = childNum - 1; break;
                  default: throw testNever(node.Op);
                }
                vs.assignVar(pid, {
                  integer: true,
                  varName: childStr,
                  act: { key: 'default', value: String(node.number) },
                });
                /**
                 * If unary operator is:
                 * - postfix: then exit 1 <=> error or prev value zero.
                 * - prefix: then exit 1 <=> error or next value zero.
                 */
                node.exitCode = node.Post
                  ? (Number.isInteger(childNum) && childNum) ? 0 : 1
                  : (Number.isInteger(node.number) && node.number) ? 0 : 1;
                break;
              }
              default: {
                throw new ShError(`${node.Op}: unsupported unary arithmetic symbol`, 2);
              }
            }
          }),
        );
      }
      case 'Word': {
        return this.Expand(node);
      }
      default: throw testNever(node);
    }
  }

  private ArrayExpr({ Elems }: Sh.ArrayExpr): Observable<ArrayAssign> {
    const pairs = Elems.map(({ Index, Value }) => ({
      key: Index ? this.ArithmExpr(Index) : null,
      value: this.Expand(Value),
    }));

    return of(null).pipe(
      mergeMap(async function* () {
        for (const { key, value } of pairs) {
          yield {
            key: key ? (await lastValueFrom(key)).value : null,
            // e.g. brace expansion can provide many values
            values: (await lastValueFrom(value)).values,
          };
        }
      }),
      // Combine all pairs into a single 'array-asgn' message
      reduce((agg, { key, values }) => {
        agg.pairs.push(...values.map(value => ({ key, value })));
        return agg;
      }, act.arrayAsgn([])),
    );
  }

  private Assign({
    Name, Value, Append, Array: ArrayNode, Index, Naked,
    meta, declOpts = {},
  }: Sh.Assign): Observable<ProcessAct> {
    const { pid } = meta
    const varName = Name.Value;

    if (ArrayNode) {
      return of(null).pipe(
        mergeMap(async function* () {
          const { pairs } = await lastValueFrom(ts.ArrayExpr(ArrayNode));

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
          const { value: index } = await lastValueFrom(ts.ArithmExpr(Index))
          // Unsure if naked is possible here
          const value = Naked
            ? undefined
            : Value
              ? (await lastValueFrom(ts.Expand(Value))).value
              : ''; // If {x[i]=} then no def.value so use ''
          vs.assignVar(pid, { ...declOpts, varName, act: { key: 'item', index, value } });
        }),
      );
    } else {
      /**
       * `x=foo` and also `declare -a x` and `declare -a x=foo`
       */
      return of(null).pipe(// NOTE this stream is always empty
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

  private CallExpr(node: Sh.CallExpr, extend: CommandExtension): Observable<ProcessAct> {
    return of(null).pipe(
      mergeMap(async function* () {
        const args = await ts.performShellExpansion(node.Args);
        console.log('args', args);
        
        if (args.length) {
          // Run builtin, run script or invoke function
          let file: FsFile | null, func: NamedFunction;
          const { pid } = node.meta;

          if (bs.isBuiltinCommand(args[0])) {
            await bs.runBuiltin(args[0]);
          } else if (file = fs.resolvePath(pid, args[0])) {
            await ps.runScript(pid, file);
          } else if (func = vs.getFunction(pid, args[0])) {
            await vs.invokeFunction(pid, func);
          } else {
            throw new ShError(`${args[0]}: unrecognised command`, 1);
          }
        } else {// Assign vars in this process
          await ts.assignVars(node, extend.Redirs);
        }
      })
    );
  }

  /**
   * Construct a simple command (CallExpr), or compound command.
   */
  private Command(
    node: null | Sh.Command,
    extend: CommandExtension,
  ): Observable<ProcessAct> {
    if (!node) {
      // We don't support pure redirections
      return throwError(new ShError(`simple commands without args or assigns are unsupported`, 2));
    } else if (node.type === 'CallExpr') {
      return this.CallExpr(node, extend); // Simple command
    }
    // Compound command
    return of(null).pipe(
      mergeMap(async function*() {
        let cmd: Observable<ProcessAct> = null as any;
    
        switch (node.type) {
          case 'ArithmCmd': cmd = ts.ArithmCmd(node); break;
          // case 'BinaryCmd': child = this.BinaryCmd(Cmd); break;
          // case 'Block': child = this.Block(Cmd); break;
          // case 'CaseClause': child = this.CaseClause(Cmd); break;
          // case 'CoprocClause': {
          //   /**
          //    * TODO
          //    */
          //   child = this.CoprocClause(Cmd);
          //   break;
          // }
          // case 'DeclClause': child = this.DeclClause(Cmd); break;
          // case 'ForClause': child = this.ForClause(Cmd); break;
          // case 'FuncDecl': child = this.FuncDecl(Cmd); break;
          // case 'IfClause': child = this.IfClause(Cmd); break;
          // case 'LetClause': child = this.LetClause(Cmd); break;
          // case 'Subshell': child = this.Subshell(Cmd); break;
          // case 'TestClause': child = this.TestClause(Cmd); break;
          // case 'TimeClause': child = this.TimeClause(Cmd); break;
          // case 'WhileClause': child = this.WhileClause(Cmd); break;
          // default: throw testNever(Cmd);
          default: return;
        }

        const { Redirs, background, negated } = extend;
        if (background) {
          // yield* this.runInBackground(dispatch, processKey);
          ps.setExitCode(node.meta.pid, 0);
        } else {
          // TODO apply/remove redirections
          const redirects = Redirs.map((x) => ts.Redirect(x));
          // await awaitEnd(cmd);
          await lastValueFrom(cmd);
        }
      })
    );

    // return new CompoundComposite({// Compound command.
    //   key: CompositeType.compound,
    //   child,
    //   redirects: Redirs.map((x) => this.Redirect(x)),
    //   background,
    //   negated,
    // });
  }

  private Expand(node: Sh.Word): Observable<Expanded> {
    if (node.Parts.length > 1) {
      return of(null).pipe(
        mergeMap(async function*() {
          // Compute each part, storing flat result in node
          for (const wordPart of node.Parts) {
             const { value } = await lastValueFrom(ts.ExpandPart(wordPart));
             wordPart.string = value;
          }
          /*
          * Is the last value computed via a parameter/command-expansion,
          * and if so does it have trailing whitespace?
          */
          let lastTrailing = false;
          const values = [] as string[];

          for (const { type, string } of node.Parts) {
            const value = string!;
            if (type === 'ParamExp' || type === 'CmdSubst') {
              const vs = expandService.normalizeWhitespace(value!, false);// Do not trim
              // console.log({ value, vs });
              if (!vs.length) {
                continue;
              } else if (!values.length || lastTrailing || /^\s/.test(vs[0])) {
                // Freely add, although trim 1st and last
                values.push(...vs.map((x) => x.trim()));
              } else {
                // Either {last(vs)} a trailing quote, or it has no trailing space
                // Since vs[0] has no leading space we must join words
                values.push(values.pop() + vs[0].trim());
                values.push(...vs.slice(1).map((x) => x.trim()));
              }
              // Check last element (pre-trim)
              lastTrailing = /\s$/.test(last(vs) as string);
            } else if (!values.length || lastTrailing) {// Freely add
              values.push(value);
              lastTrailing = false;
            } else {// Must join
              values.push(values.pop() + value);
              lastTrailing = false;
            }
          }

          node.string = values.join(' '); // If part of ArithmExpr?
          yield act.expanded(values); // Need array?
        }),
      );
    }
    return this.ExpandPart(node.Parts[0]).pipe(
      tap(({ value }) => node.string = value),
    );
  }

  private ExpandPart(node: Sh.WordPart): Observable<Expanded> {
    switch (node.type) {
      case 'ArithmExp': {
        return this.ArithmExp(node);
      }
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
        return of(act.expanded(expand.literal(node)));
      }
      case 'ParamExp': {
        return this.ParamExp(node);
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
        return of(act.expanded(expand.singleQuotes(node)));
      }
      // default: throw testNever(input);
      default:
        throw Error(`${node.type} unimplemented`);
    }
  }

  private File({ StmtList }: Sh.File): Observable<ProcessAct> {
    return from(StmtList.Stmts).pipe(
      concatMap(x => this.Stmt(x)),
    );
  }

  private ParamExp(node: Sh.ParamExp): Observable<Expanded> {
    const def = this.transpileParam(node);
    const { pid } = node.meta;

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
    return of(null).pipe(
      mergeMap(async function* () {
        const index = def.index ? (await lastValueFrom(def.index)).value : null;
        const varValue = vs.lookupVar(pid, def.param);
        const paramValues = vs.getVarValues(index, varValue);

        switch (def.parKey) {
          /**
           * case: ${x^y}, ${x^^y}, ${x,y} or ${x,,y} (also ${x[1]^^}).
           */
          case ParamType.case: {
            const { all, to, pattern } = def;
            let re = /^.$/;// Pattern defaults to '?'
    
            if (pattern) {// Evaluate pattern and convert to RegExp
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
          case ParamType.default: {
            const { alt, colon, symbol } = def;
            // If colon then applies if 'unset', or 'null' (i.e. empty-string).
            // Otherwise, only applies if unset.
            const applies = colon
              ? !paramValues.length || (paramValues.length === 1 && paramValues[0] === '')
              : !paramValues.length;
    
            switch (symbol) {
              case '-':
              case '=': {
                if (applies) {
                  yield act.expanded(alt ? (await lastValueFrom(alt)).value : '');
                  if (symbol === '=') {// Additionally assign to param
                    vs.assignVar(pid, { varName: def.param, act: { key: 'default', value: paramValues.join('') } });
                  }
                } else {
                  yield act.expanded(paramValues.join(''));
                }
                break;
              }
              case '?': {
                if (applies) {
                  node.exitCode = 1;
                  return alt
                    ? ps.warn(pid, (await lastValueFrom(alt)).value)
                    : ps.warn(pid, `${def.param}: required but unset or null.`);
                } else {
                  yield act.expanded(paramValues.join(''));
                }
                break;
              }
              case '+': {
                yield act.expanded(applies || !alt
                  ? ''
                  : (await lastValueFrom(alt)).value);
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
            const keys = vs.getVarKeys(varValue);
            if (def.split) {
              yield* keys.map(key => act.expanded(key));
            } else {
              yield act.expanded(keys.join(' '));
            }
            break;
          }
          /**
           * length: ${#x}, ${#x[i]}, ${#x[@]} or ${#x[*]}.
           */
          case ParamType.length: {
            const { of: Of } = def;
            if (Of === 'word') {
              // `paramValues` should be [] or ['foo'].
              yield act.expanded(String((paramValues[0] || '').length));
            } else {// of: 'values'.
              yield act.expanded(String(paramValues.length));
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
              yield act.expanded(paramValues);
            } else if (index === '*') {
              yield act.expanded(paramValues.join(' '));
            } else {
              yield act.expanded(paramValues.join(''));
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
              const result = vs.lookupVar(pid, nextParam);
              yield act.expanded(vs.getVarValues(null, result).join(''));
            } else {
              yield act.expanded('');
            }
            break;
          }
          /**
           * positional: $1, $2, etc.
           */
          case ParamType.position: {
            yield act.expanded(paramValues.join(''));
            break;
          }
          /**
           * remove:
           * - prefix: ${x#y} or ${x##y}.
           * - suffix: ${x%y} or ${x%%y}.
           */
          case ParamType.remove: {
            if (def.pattern) {
              // Evaluate pattern, convert to RegExp.
              const { value } = await lastValueFrom(def.pattern);
              const baseRe = (globrex(value, { extended: true }).regex as RegExp)
                .source.slice(1, -1);// Sans ^ and $.
              // Match largest/smallest prefix/suffix.
              const regex = new RegExp(def.dir === 1
                ? (def.greedy ? `^${baseRe}.*` : `^${baseRe}.*?`)
                : (def.greedy ? `.*${baseRe}$` : `.*?${baseRe}$`));
              // Remove matching.
              yield act.expanded(paramValues.join('').replace(regex, ''));
            }
            break;
          }
          // /**
          //  * replace: ${parameter/pattern/string}.
          //  * We support 'replace all' via //.
          //  * TODO support # (prefix), % (suffix).
          //  */
          case ParamType.replace: {
            const { all, orig, with: With } = def;
            const origValue = (await lastValueFrom(orig)).value;
            const subst = With
              ? (await lastValueFrom(With)).value
              : '';
            const regex = new RegExp(origValue, all ? 'g' : '');
            yield act.expanded(paramValues.join('').replace(regex, subst));
            break;
          }
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
          /**
           * variables: ${!param*} or ${!param@}.
           */
          case ParamType.vars: {
            const { split, param } = def;
            if (param.length) {
              const result = vs.findVarNames(pid, param);
              yield act.expanded(split ? result : result.join(' '));
            } else {
              yield act.expanded('');
            }
            break;
          }
          // default: throw testNever(def);
        }
        // return act.expanded([]); 
      }),
    );
  }

  /**
   * TODO
   */
  private Redirect(node: Sh.Redirect): Observable<ProcessAct> {
    return of(act.unimplemented());
  }

  private Stmt({ Negated, Background, Redirs, Cmd }: Sh.Stmt): Observable<ProcessAct> {
    return this.Command(Cmd, {
      Redirs,
      background: Background,
      negated: Negated,
    });
  }

  private async assignVars(node: Sh.CallExpr, redirects: Sh.Redirect[]) {
    for (const assign of node.Assigns) {
      try {
        await awaitEnd(this.Assign(assign));
      } catch (e) {
        if (e instanceof ShError) {
          console.error('Caught assign error', e);
          node.exitCode = e.exitCode;
        } else {
          throw e;
        }
      }
    }

    // Apply redirections in temporary scope
    // We still run them as they may have side-effects
    if (redirects.length) {
      const { pid } = redirects[0].meta;
      ps.pushRedirectScope(pid);
      for (const redirect of redirects) {
        try {
          await awaitEnd(this.Redirect(redirect));
        } catch (e) {
          if (e instanceof ShError) {
            console.error('Caught redirects error', e);
            node.exitCode = e.exitCode;
            break; // Stop immediately
          } else {
            throw e;
          }
        }
      }
      ps.popRedirectScope(pid);
    }
  }

  /** ArithmExpr sans Word */
  private isArithmOp(node: Sh.ParsedSh): node is Exclude<Sh.ArithmExpr, Sh.Word> {
    return !!(arithmOp as Record<string, true>)[node.type];
  }

  private isArithmExprSpecial(arithmExpr: null | Sh.ArithmExpr): null | '@' | '*' {
    if (
      arithmExpr?.type === 'Word'
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

  private isWordPart(node: Sh.ParsedSh): node is Sh.WordPart {
    return !!(wordPart as Record<string, true>)[node.type];
  }
  
  private async performShellExpansion(Args: Sh.Word[]): Promise<string[]> {
    const expanded = [] as string[];

    for (const word of Args) {
      const result = await lastValueFrom(this.Expand(word));
      const single = word.Parts.length === 1 ? word.Parts[0] : null;

      if (word.exitCode) {
        throw new ShError('failed to expand word', word.exitCode);
      } else if (single?.type === 'SglQuoted') {
        expanded.push(result.value); // No filename expansion for '' and $''.
      }
      /**
       * Normalize command and parameter expansion,
       * e.g. ' foo \nbar ' -> ['foo', 'bar']
       */
      const fileArgs = single?.type === 'ParamExp' || single?.type === 'CmdSubst'
        ? expandService.normalizeWhitespace(result.value)
        : result.values;
      /**
       * Filename expansion.
       */
      for (const pattern of fileArgs) {
        if (/\*|\?|\[/.test(pattern)) {
          // Could be a glob.
          // console.log('Applying filename expansion to:', JSON.stringify(pattern));// DEBUG
          const { pid } = word.meta;
          const fileExpand = expandService.filePath(pid, pattern);
          fileExpand?.sort();
          // console.log({ result });// DEBUG
          expanded.push(...(fileExpand || [pattern]));
        } else {
          expanded.push(pattern);
        }
      }
    }
    return expanded;
  }

  /**
   * Sets node.parent.{string,number}.
   */
  private async runArithmExpr(node: Sh.ExpandType) {
    let textValue: string;
    if (this.isWordPart(node)) {// WordPart expands to multiple values
      textValue = (await lastValueFrom(this.ExpandPart(node))).value;
    } else {// ArithmExpr expands to exactly one string/number
      await awaitEnd(this.ArithmExpr(node)); 
      textValue = node.string!;
    }

    let value = parseInt(textValue);
    if (Number.isNaN(value)) {// Try looking up variable
      const varValue = vs.expandVar(node.meta.pid, textValue);
      value = parseInt(varValue) || 0;
    }

    // Propagate string and evaluated number upwards
    (node.parent! as Sh.BaseNode).string = textValue;
    (node.parent! as Sh.BaseNode).number = value;
  }

  private transpileParam({
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

const arithmOp = {
  'BinaryArithm': true,
  'UnaryArithm': true,
  'ParenArithm': true,
  // 'Word': true,
};

const wordPart = {
  'Lit': true,
  'SglQuoted': true,
  'DblQuoted': true,
  'ParamExp': true,
  'CmdSubst': true,
  'ArithmExp': true,
  'ProcSubst': true,
  'ExtGlob': true,
};


export const transpileSh = new TranspileShService;

const ts = transpileSh; // Local shortcut