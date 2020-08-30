import { Observable, from, of } from 'rxjs';
import { concatMap, reduce, tap, map } from 'rxjs/operators';
import * as Sh from '@model/shell/parse.service';
import { ProcessAct, Expanded } from './process.model';
import { expandService as expand } from './expand.service';
import { ParameterDef, ParamType } from './parameter.model';
import { testNever } from '@model/generic.model';

type Obs = Observable<ProcessAct>;

/**
 * Previously, transpilation created Terms which we cloned.
 * Since transpilation won't do much precomputation any more,
 * we'll instead clone `Sh.File`s and set sessionKey, pid somehow.
 */

class TranspileShService {

  transpile(parsed: Sh.File): Obs {
    const transpiled = this.File(parsed);
    console.log('TRANSPILED', transpiled); // DEBUG
    return transpiled;
  }

  File({ StmtList }: Sh.File): Obs {
    return from(StmtList.Stmts).pipe(
      concatMap(x => this.Stmt(x)),
    );
  }

  Stmt({ Negated, Background, Redirs, Cmd }: Sh.Stmt): Obs {
    return this.Command(Cmd, {
      Redirs,
      background: Background,
      negated: Negated,
    });
  }

  /**
   * Construct a simple command (CallExpr), or compound command.
   */
  Command(
    Cmd: null | Sh.Command,
    extend: CommandExtension,
  ): Obs {
    if (!Cmd || Cmd.type === 'CallExpr') {
      return this.CallExpr(Cmd, extend);
    }

    return of({ key: 'unimplemented' });

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

  CallExpr(
    Cmd: null | Sh.CallExpr,
    extend: CommandExtension,
  ): Obs {
    const { Redirs, background, negated } = extend;

    if (Cmd) {
      const { Assigns, Args } = Cmd;

      // return of({ key: 'unimplemented' });
      return from(Args).pipe(
        concatMap(arg => this.Expand(arg)),
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
    return of({ key: 'unimplemented' });
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

  public Expand({ Parts }: Sh.Word): Observable<Expanded> {
    /**
     * TODO
     * - expand parts in sequence, forwarding messages
     * - aggregate their output via `reduce`, compute values
     * - emit transform as same message type for later processing
     */
    if (Parts.length > 1) {
      return from(Parts).pipe(
        concatMap(wordPart => this.ExpandPart(wordPart)),
        reduce(({ key, values }, item: Expanded) => ({
          key,
          values: values.concat(item.values),
        }), { key: 'expanded' as 'expanded', values: [] as string[] }),
        tap((msg) => {
          console.log('aggregated', msg);
        }),
        // ...
      );
    }
    return this.ExpandPart(Parts[0]);
  }

  public ExpandPart(input: Sh.WordPart): Observable<Expanded> {
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
        return of({
          key: 'expanded',
          values: [''], // TODO
        });
      }
      case 'Lit': {
        return of({
          key: 'expanded',
          values: expand.literal(input),
        });
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
        return of({
          key: 'expanded',
          values: expand.singleQuotes(input),
        });
      }
      // default: throw testNever(input);
      default:
        throw Error(`${input.type} unimplemented`);
    }
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

  private ParamExp({
    Excl, Exp, Index, Length, Names, Param, Repl, Short, Slice,
  }: Sh.ParamExp): Observable<Expanded> {

    // Must assign below
    let sub = null as null | ParameterDef<Observable<Expanded>, Observable<Expanded>>;
    const base = {
      param: Param.Value,
      short: Short,
      index: Index ? this.ArithmExpr(Index) : undefined,
    };

    if (Excl) {// ${!...}
      if (Index) {
        const special = this.isArithmExprSpecial(Index);
        if (special) {// ${!x[@]}, ${x[*]}
          sub = { ...base, parKey: ParamType['keys'], split: special === '@' };
        } else {// Indirection ${!x[n]} or ${!x["foo"]}
          sub = sub || { ...base, parKey: ParamType['pointer'] };
        }
      } else if (Names) {// ${!x*}, ${!x@}
        sub = { ...base, parKey: ParamType['vars'], split: (Names === '@') };
      } else {// Indirection ${!x}
        sub = { ...base, parKey: ParamType['pointer'] };
      }
    } else {// No exclamation
      if (Exp) {
        const pattern = Exp.Word ? this.Expand(Exp.Word) : null;
        const alt = pattern;
        switch (Exp.Op) {
          case '^': sub = { ...base, parKey: ParamType.case, pattern, to: 'upper', all: false }; break;
          case '^^': sub = { ...base, parKey: ParamType.case, pattern, to: 'upper', all: true };  break;
          case ',': sub = { ...base, parKey: ParamType.case, pattern, to: 'lower', all: false }; break;
          case ',,': sub = { ...base, parKey: ParamType.case, pattern, to: 'lower', all: true }; break;
          // remove
          case '%': sub = { ...base, parKey: ParamType.remove, pattern, greedy: false, dir: 1 }; break;
          case '%%': sub = { ...base, parKey: ParamType.remove, pattern, greedy: true, dir: 1 }; break;
          case '#': sub = { ...base, parKey: ParamType.remove, pattern, greedy: false, dir: -1 }; break;
          case '##': sub = { ...base, parKey: ParamType.remove, pattern, greedy: true, dir: -1 }; break;
          // default
          case '+': sub = { ...base, parKey: ParamType.default, alt, symbol: '+', colon: false }; break;
          case ':+': sub = { ...base, parKey: ParamType.default, alt, symbol: '+', colon: true }; break;
          case '=': sub = { ...base, parKey: ParamType.default, alt, symbol: '=', colon: false }; break;
          case ':=': sub = { ...base, parKey: ParamType.default, alt, symbol: '=', colon: true }; break;
          case '?': sub = { ...base, parKey: ParamType.default, alt, symbol: '?', colon: false }; break;
          case ':?': sub = { ...base, parKey: ParamType.default, alt, symbol: '?', colon: true }; break;
          case '-': sub = { ...base, parKey: ParamType.default, alt, symbol: '-', colon: false }; break;
          case ':-': sub = { ...base, parKey: ParamType.default, alt, symbol: '-', colon: true }; break;
          // ...
          default: throw new Error(
            `Unsupported operation '${Exp.Op}' in parameter expansion of '${Param.Value}'.`);
        }
      } else if (Length) {// ${#x}, ${#x[2]}, ${#x[@]}
        const isSpecial = Boolean(this.isArithmExprSpecial(Index));
        sub = { ...base, parKey: ParamType['length'], of: isSpecial ? 'values' : 'word' };
      } else if (Repl) {// ${x/y/z}, ${x//y/z}, ${x[foo]/y/z}
        sub = { ...base, parKey: ParamType['replace'], all: Repl.All,
          orig: this.Expand(Repl.Orig),
          with: Repl.With ? this.Expand(Repl.With) : null,
        };
      } else if (Slice) {// ${x:y:z}, ${x[foo]:y:z}
        sub = { ...base, parKey: ParamType['substring'],
          from: this.ArithmExpr(Slice.Offset),
          length: Slice.Length ? this.ArithmExpr(Slice.Length) : null,
        };

      } else if (Index) {// ${x[i]}, ${x[@]}, ${x[*]}
        // NOTE ${x[@]} can split fields in double quotes.
        sub = { ...base, parKey: ParamType['plain'] };
      } else if (base.param === String(parseInt(base.param))) {
        sub = { ...base, parKey: ParamType['position'] };
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
            sub = { ...base, parKey: ParamType['special'], param: base.param };
            break;
          }// plain
          default: {
            sub = { ...base, parKey: ParamType['plain'] };
          }
        }
      }
    }

    return new Observable();
    // return new ParameterExpand({
    //   key: CompositeType.expand,
    //   expandKey: ExpandType.parameter,
    //   ...sub,
    // });
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

}
interface CommandExtension {
  Redirs: Sh.Redirect[];
  background: boolean;
  negated: boolean;
}

export const transpileSh = new TranspileShService;
