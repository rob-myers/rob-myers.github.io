import { Observable, from, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import * as Sh from '@model/shell/parse.service';
import { ProcessAct } from './process.model';

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

    return new Observable();
    // if (Parts.length > 1) {
    //   return new PartsExpand({
    //     key: CompositeType.expand,
    //     expandKey: ExpandType.parts,
    //     cs: Parts.map((wordPart) => this.ExpandPart(wordPart)),
    //     sourceMap: this.sourceMap({ Pos, End }),
    //   });
    // }
    // return this.ExpandPart(Parts[0]);
  }

}
interface CommandExtension {
  Redirs: Sh.Redirect[];
  background: boolean;
  negated: boolean;
}

export const transpileSh = new TranspileShService;
