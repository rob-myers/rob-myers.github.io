import { Observable, from, of } from 'rxjs';
import { concatMap, reduce, tap, map } from 'rxjs/operators';
import * as Sh from '@model/shell/parse.service';
import { ProcessAct, Expanded } from './process.model';
import { expandService as expand } from './expand.service';

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
      const {Assigns, Args } = Cmd;
      const words = Args.map((arg) => this.Expand(arg));

      return of({ key: 'unimplemented' });

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

  public Expand({ Parts }: Sh.Word): Obs {
    /**
     * TODO
     * - expand parts in sequence, forwarding messages
     * - aggregate their output via `reduce`, compute values
     * - emit as array for later processing
     */

    // return new Observable();
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
      );
      // return new PartsExpand({
      //   key: CompositeType.expand,
      //   expandKey: ExpandType.parts,
      //   cs: Parts.map((wordPart) => this.ExpandPart(wordPart)),
      //   sourceMap: this.sourceMap({ Pos, End }),
      // });
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
      case 'ExtGlob': {// TODO
        return of({ key: 'expanded', values: [''] });
      }
      case 'Lit': {
        return of({
          key: 'expanded',
          values: expand.literal(input),
        });
        // new LiteralExpand({
        //   key: CompositeType.expand,
        //   expandKey: ExpandType.literal,
        //   value: input.Value,
        //   sourceMap: this.sourceMap({ Pos, End }),
        // });
      }
      case 'ParamExp': {
        return of({
          key: 'expanded',
          values: expand.parameter(input),
        });
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
        // const { Dollar, Value } = input;
        // return new SingleQuoteExpand({
        //   key: CompositeType.expand,
        //   expandKey: ExpandType.singleQuote,
        //   interpret: Dollar,
        //   value: Value,
        //   sourceMap: this.sourceMap({ Pos, End },
        //     { key: 'single-quote', pos: Left, end: Right },
        //   ),
        // });
      }
      // default: throw testNever(input);
      default:
        throw Error(`${input.type} unimplemented`);
    }
  }

}
interface CommandExtension {
  Redirs: Sh.Redirect[];
  background: boolean;
  negated: boolean;
}

export const transpileSh = new TranspileShService;
