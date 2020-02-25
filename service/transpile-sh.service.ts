import * as Sh from '@service/parse-sh.service';
import { testNever, flatten, last, Unpacked } from '@model/generic.model';

import { Term, CompositeType, IteratorType, ExpandComposite, DeclareBuiltinType, DeclareBuiltinTerm } from '@model/os/term.model';
import { TermComment, TermSourceMap, CodePosition } from '@model/sh/base-term';
import { TimeComposite } from '@model/sh/composite/time.composite';
import { TestOpComposite } from '@model/sh/composite/test-op.composite';
import { TestComposite } from '@model/sh/composite/test.composite';
import { SubshellComposite } from '@model/sh/composite/subshell.composite';
import { SimpleComposite } from '@model/sh/composite/simple.composite';
import { SeqComposite } from '@model/sh/composite/seq.composite';
import { RedirectComposite } from '@model/sh/composite/redirect.composite';
import { PipeComposite } from '@model/sh/composite/pipe.composite';
import { OrComposite } from '@model/sh/composite/or.composite';
import { LetComposite } from '@model/sh/composite/let.composite';
import { ArithmExpand } from '@model/sh/expand/arithmetic.expand';
import { CstyleForIterator } from '@model/sh/iterator/cstyle-for.iterator';
import { LiteralExpand } from '@model/sh/expand/literal.expand';
import { ParameterExpand, ParameterDef } from '@model/sh/expand/parameter.expand';
import { PartsExpand } from '@model/sh/expand/parts.expand';
import { CommandExpand } from '@model/sh/expand/command.expand';
import { DoubleQuoteExpand } from '@model/sh/expand/double-quote.expand';
import { ExtGlobExpand } from '@model/sh/expand/ext-glob.expand';
import { ProcessExpand } from '@model/sh/expand/process.expand';
import { SingleQuoteExpand } from '@model/sh/expand/single-quote.expand';
import { DeclareBuiltin } from '@model/sh/builtin/declare.builtin';
import { BuiltinOtherType, BuiltinSpecialType } from '@model/sh/builtin.model';
import { LocalBuiltin } from '@model/sh/builtin/local.builtin';
import { ExportBuiltin } from '@model/sh/builtin/export.builtin';
import { ReadonlyBuiltin } from '@model/sh/builtin/readonly.builtin';
import { TypesetBuiltin } from '@model/sh/builtin/typeset.builtin';
import { ExpandType, ParamType } from '@model/sh/expand.model';
import { ForIterator } from '@model/sh/iterator/for.iterator';
import { WhileIterator } from '@model/sh/iterator/while.iterator';
import { ArithmOpComposite } from '@model/sh/composite/arithm-op.composite';
import { ArrayComposite } from '@model/sh/composite/array.composite';
import { AssignComposite } from '@model/sh/composite/assign.composite';
import { AndComposite } from '@model/sh/composite/and.composite';
import { BlockComposite } from '@model/sh/composite/block.composite';
import { CaseComposite, CasePart } from '@model/sh/composite/case.composite';
import { CompoundComposite } from '@model/sh/composite/compound.composite';
import { FunctionComposite } from '@model/sh/composite/function.composite';
import { IfComposite, IfPart } from '@model/sh/composite/if.composite';

export class TranspileShService {

  public transpile(parsed: Sh.File): Term {
    const transpiled = this.File(parsed);
    /**
     * DEBUG.
     */
    console.log('TRANSPILED', transpiled);
    return transpiled;
  }
  /**
   * (( x = y / 2 , z = x * y ))
   */
  public ArithmCmd({
    Pos, End, Left, Right, X,
    // Unsigned,
  }: Sh.ArithmCmd): ArithmExpand {
    return new ArithmExpand({
      key: CompositeType.expand,
      expandKey: ExpandType.arithmetic,
      expr: this.ArithmExpr(X),
      // sub: { expr: this.ArithmExpr(X) },
      sourceMap: this.sourceMap(
        { Pos, End },
        { key: 'paren', pos: Left, end: Right },
      ),
      comments: [],
    });
  }
  /**
   * y=$(( 2 ** x ))
   */
  public ArithmExp({
    Pos, End, X, Left, Right,
    // Unsigned, Bracket
  }: Sh.ArithmExp): ArithmExpand {
    return new ArithmExpand({
      key: CompositeType.expand,
      expandKey: ExpandType.arithmetic,
      expr: this.ArithmExpr(X),
      sourceMap: this.sourceMap(
        { Pos, End },
        { key: 'paren', pos: Left, end: Right }),
    });
  }
  /**
   * $(( x * y ))
   * $(( 2 * (x + 1) )),
   * (( x++ ))
   * x[1 + "2$i"]=y.
   */
  public ArithmExpr(
    input: Sh.ArithmExpr,
    ...extra: ExtraSourceMap[]
  ): ArithmOpComposite | ExpandComposite {
    const { Pos, End } = input;

    switch (input.type) {
      case 'BinaryArithm': {
        return new ArithmOpComposite({
          key: CompositeType.arithm_op,
          symbol: input.Op, 
          cs: [this.ArithmExpr(input.X), this.ArithmExpr(input.Y)],
          postfix: false,
          sourceMap: this.sourceMap({ Pos, End },
            ...extra, // Earlier first.
            { key: input.Op, pos: input.OpPos },
          ),
        });
      }
      case 'ParenArithm': {
        // NOTE we ignore input.{Pos,End}.
        return this.ArithmExpr(
          input.X,
          { key: 'paren', pos: input.Lparen, end: input.Rparen },
        );
      }
      case 'UnaryArithm': {
        return new ArithmOpComposite({
          key: CompositeType.arithm_op,
          symbol: input.Op,
          cs: [this.ArithmExpr(input.X)],
          sourceMap: this.sourceMap({ Pos, End },
            ...extra, // Earlier first.
            { key: input.Op, pos: input.OpPos },
          ),
          postfix: input.Post,
        });
      }
      case 'Word': {
        return this.Expand(input);
      }
      default: throw testNever(input);
    }
  }

  public ArrayExpr(
    { Pos, End, Elems, Last, Lparen, Rparen }: Sh.ArrayExpr,
  ): ArrayComposite {
    const sourceMap = this.sourceMap(
      { Pos, End },
      { key: 'paren', pos: Lparen, end: Rparen },
      ...Elems.map(({ Pos, End }, i) =>
        ({ key: `item-${i}`, pos: Pos, end: End })),
    );
    return new ArrayComposite({
      key: CompositeType.array,
      pairs: Elems.map<Unpacked<ArrayComposite['def']['pairs']>>((
        { Index, Value, /* Pos, End, Comments */ }) => ({
        key: Index ? this.ArithmExpr(Index) : null,
        value: this.Expand(Value),
      })),
      sourceMap,
      comments: ([] as TermComment[]).concat(
        ...Elems.map(({ Comments }) => this.comments(Comments)),
        this.comments(Last),
      ),
    });
  }

  public Assign({
    Pos, End, Name, Value,
    Append, Array, Index,
    Naked,
  }: Sh.Assign): AssignComposite {
    const sourceMap = this.sourceMap({ Pos, End});
    // const baseAssign: BaseAssignOpts = {
    //   array: false,
    //   associative: false,
    //   exported: false,
    //   integer: false,
    //   local: false,
    //   lower: false,
    //   readonly: false,
    //   upper: false,
    // };
    if (Array) {
      return new AssignComposite({
        // ...baseAssign,
        key: CompositeType.assign,
        sourceMap,
        subKey: 'array',
        // x=(foo bar), x=([f]=oo [b]=ar)
        array: this.ArrayExpr(Array),
        varName: Name.Value,
        naked: Naked,
      });
    } else if (Index) {
      return new AssignComposite({
        // ...baseAssign,
        key: CompositeType.assign,
        sourceMap,
        subKey: 'item',
        append: Append,
        index: this.ArithmExpr(Index),
        value: Value ? this.Expand(Value) : null,
        varName: Name.Value,
        naked: Naked,
      });
    } else {
      return new AssignComposite({
        // ...baseAssign,
        key: CompositeType.assign,
        sourceMap,
        subKey: 'var',
        varName: Name.Value,
        value: Value ? this.Expand(Value) : null,
        append: Append,
        naked: Naked,
      });
    }
  }
  
  public BinaryCmd(cmd: Sh.BinaryCmd): Term {
    // Collect all contiguous binary cmds for same operator.
    const cmds = this.binaryCmds(cmd);

    // Restrict to their leaves, assuming right-biased.
    const lastCmd = last(cmds) as Sh.BinaryCmd;
    const stmts = cmds.map(({ X }) => X).concat(lastCmd.Y);

    // Interval for all binary commands.
    const [Pos, End] = [cmds[0].Pos, lastCmd.End];
    const sourceMap = this.sourceMap({ Pos, End },
      ...cmds.map(({ OpPos }) => ({ key: 'op', pos: OpPos })),
      ...stmts.map(({ Pos }) => ({ key: 'child', pos: Pos })),
    );

    switch (cmd.Op) {
      case '&&': {
        return new AndComposite({
          key: CompositeType.and,
          sourceMap,
          cs: stmts.map((stmt) => this.Stmt(stmt)),
        });
      }
      case '||': {
        return new OrComposite({
          key: CompositeType.or, 
          cs: stmts.map((stmt) => this.Stmt(stmt)),
          sourceMap,
        });
      }
      case '|': {
        return new PipeComposite({
          key: CompositeType.pipe,
          /**
           * TODO Remove hard-coding.
           */
          capacity: 1000000,
          cs: stmts.map((stmt) => this.Stmt(stmt)),
          sourceMap,
        });
      }
      /**
       * TODO others.
       */
      default: return null as any;
    }
  }
  
  public Block(
    { Pos, End, Lbrace, Rbrace, StmtList }: Sh.Block,
  ): Term {
    return new BlockComposite({
      key: CompositeType.block,
      cs: StmtList.Stmts.map((stmt) => this.Stmt(stmt)),
      sourceMap: this.sourceMap(
        { Pos, End },
        { key: 'brace', pos: Lbrace, end: Rbrace },
      ),
      comments: this.comments(StmtList.Last),
    });
  }
  
  public CallExpr(
    Cmd: null | Sh.CallExpr,
    extend: CommandExtension,
  ): Term {
    const { Pos, End, extra, Redirs, comments, background, negated } = extend;

    if (Cmd) {
      const { Pos: InnerPos, End: InnerEnd, Assigns, Args } = Cmd;
      return new SimpleComposite({
        key: CompositeType.simple,
        assigns: Assigns.map((assign) => this.Assign(assign)),
        redirects: Redirs.map((redirect) => this.Redirect(redirect)),
        words: Args.map((arg) => this.Expand(arg)),
        comments,
        background,
        negated,
        sourceMap: this.sourceMap({ Pos, End },
          // i.e. Position of words, excluding assigns & redirects.
          { key: 'inner', pos: InnerPos, end: InnerEnd },
          ...extra,
        ),
      });
    }
    /**
     * Redirects without command can have effects:
     * - > out # creates blank file out
     * - echo "$( < out)" # echos contents of out
     */
     
    return new SimpleComposite({
      key: CompositeType.simple,
      assigns: [],
      redirects: Redirs.map((redirect) => this.Redirect(redirect)),
      words: [],
      comments,
      background,
      negated,
      sourceMap: Redirs.length
        ? this.sourceMap({ Pos: Redirs[0].Pos, End: (last(Redirs) as Sh.Redirect).End })
        : undefined,
    });
  }

  public CaseClause({
    Pos, End, Case, Esac, Items, Last, Word,
  }: Sh.CaseClause): CaseComposite {
    const sourceMap = this.sourceMap(
      { Pos, End },
      { key: 'case', pos: Case },
      ...Items.map(({ Op, OpPos }, index) => ({ key: `${index}-${Op}`, pos: OpPos })),
      { key: 'esac', pos: Esac },
    );
    return new CaseComposite({
      key: CompositeType.case,
      head: this.Expand(Word),
      cases: Items.map<CasePart<Term, ExpandComposite>>((
        { Pos, End, Patterns, Op, StmtList,
          // Comments, OpPos,
        }) =>
        ({
          globs: Patterns.map((x) => this.Expand(x)),
          terminal: Op as any,
          child: this.StmtList(StmtList, { Pos, End }),
        })),
      sourceMap,
      comments: ([] as TermComment[]).concat(
        ...Items.map(({ Comments }) => this.comments(Comments)),
        this.comments(Last),
      ),
    });
  }

  /**
   * Construct a simple command (CallExpr), or complex command.
   * - Invoked by `this.Stmt` only.
   */
  public Command(
    Cmd: null | Sh.Command,
    extend: CommandExtension,
  ): Term {

    if (!Cmd || Cmd.type === 'CallExpr') {// Must be simple.
      return this.CallExpr(Cmd, extend);
    }

    let child: Term = null as any;

    switch (Cmd.type) {
      case 'ArithmCmd': child = this.ArithmCmd(Cmd); break;
      case 'BinaryCmd': child = this.BinaryCmd(Cmd); break;
      case 'Block': child = this.Block(Cmd); break;
      case 'CaseClause': child = this.CaseClause(Cmd); break;
      case 'CoprocClause': {
        /**
         * TODO
         */
        break;
      }
      case 'DeclClause': child = this.DeclClause(Cmd); break;
      case 'ForClause': child = this.ForClause(Cmd); break;
      case 'FuncDecl': child = this.FuncDecl(Cmd); break;
      case 'IfClause': child = this.IfClause(Cmd); break;
      case 'LetClause': child = this.LetClause(Cmd); break;
      case 'Subshell': child = this.Subshell(Cmd); break;
      case 'TestClause': child = this.TestClause(Cmd); break;
      case 'TimeClause': child = this.TimeClause(Cmd); break;
      case 'WhileClause': child = this.WhileClause(Cmd); break;
      default: throw testNever(Cmd);
    }

    const { Pos, End, Redirs, extra, comments, background, negated } = extend;
    const sourceMap = this.sourceMap({ Pos, End }, ...extra);

    return new CompoundComposite({// Compound command.
      key: CompositeType.compound,
      child,
      redirects: Redirs.map((x) => this.Redirect(x)),
      comments,
      background,
      negated,
      sourceMap,
    });
  }

  public DeclClause({ Pos, End, Assigns, Opts, Variant, others }: Sh.DeclClause): DeclareBuiltinTerm {
    const builtinType = Variant.Value as DeclareBuiltinType;
    const base = {
      key: CompositeType.declare as CompositeType.declare,
      variant: Variant.Value,
      assigns: Assigns.map((assign) => this.Assign(assign)),
      options: Opts.map((word) => this.Expand(word)),
      others: others.map((word) => this.Expand(word)),
      sourceMap: this.sourceMap({ Pos, End }),
    };
    
    switch (builtinType) {
      case BuiltinOtherType.declare: {
        return new DeclareBuiltin({ ...base, builtinKey: BuiltinOtherType.declare });
      }
      case BuiltinSpecialType.export: {
        return new ExportBuiltin({ ...base, builtinKey: BuiltinSpecialType.export });
      }
      case BuiltinOtherType.local: {
        return new LocalBuiltin({ ...base, builtinKey: BuiltinOtherType.local });
      }
      case BuiltinSpecialType.readonly: {
        return new ReadonlyBuiltin({ ...base, builtinKey: BuiltinSpecialType.readonly });
      }
      case BuiltinOtherType.typeset: {
        return new TypesetBuiltin({ ...base, builtinKey: BuiltinOtherType.typeset });
      }
      default: throw testNever(builtinType);
    }
  }

  public File({ StmtList }: Sh.File): Term {
    if (StmtList.Stmts.length === 1) {
      return this.Stmt(StmtList.Stmts[0]);
    }
    return new SeqComposite({
      key: CompositeType.seq,
      cs: StmtList.Stmts.map((stmt) => this.Stmt(stmt)),
      sourceMap: StmtList.Stmts.length
        ? this.sourceMap({
          Pos: StmtList.Stmts[0].Pos,
          End: (last(StmtList.Stmts) as Sh.Stmt).End,
        })
        : undefined,
      comments: this.comments(StmtList.Last),
    });
  }

  public ForClause(
    { Pos, End, Do, DonePos, DoPos, ForPos, Loop,
      // Select,
    }: Sh.ForClause
  ): CstyleForIterator | ForIterator {

    const extra: ExtraSourceMap[] = [
      { key: 'for', pos: ForPos },
      { key: 'do', pos: DoPos },
      { key: 'done', pos: DonePos },
    ];

    if (Loop.type === 'CStyleLoop') {
      const { Pos: LoopPos, End: LoopEnd, Init, Cond, Post, Lparen, Rparen } = Loop;
      return new CstyleForIterator({
        key: IteratorType.cstyle_for,
        body: this.StmtList(Do, { Pos: DoPos, End: DonePos }),
        prior: this.ArithmExpr(Init) as ArithmOpComposite,
        condition: this.ArithmExpr(Cond) as ArithmOpComposite,
        post: this.ArithmExpr(Post) as ArithmOpComposite,
        sourceMap: this.sourceMap({ Pos: LoopPos, End: LoopEnd },
          ...extra,
          { key: 'paren', pos: Lparen, end: Rparen },
        ),
      });
    }
    // Loop.type is 'WordIter'.
    const { Pos: LoopPos, End: LoopEnd, Items, Name } = Loop;
    extra.push();

    return new ForIterator({
      key: IteratorType.for,
      paramName: Name.Value,
      items: Items.map((Item) => this.Expand(Item)),
      body: this.StmtList(Do, { Pos: DoPos, End: DonePos }),
      sourceMap: this.sourceMap({ Pos, End }, ...extra, {
        key: 'loop', pos: LoopPos, end: LoopEnd
      }),
    });
  }

  public FuncDecl({ Pos, End, Name, Body,
    // Position, RsrvWord
  }: Sh.FuncDecl): FunctionComposite {
    return new FunctionComposite({
      key: CompositeType.function,
      funcName: Name.Value,
      body: this.Stmt(Body),
      sourceMap: this.sourceMap({ Pos, End }),
    });
  }

  public IfClause(input: Sh.IfClause): IfComposite {
    const ifClauses = this.collectIfClauses(input);
    
    const { Pos, End, FiPos } = input;
    const lastIndex = ifClauses.length - 1;

    const sourceMap = this.sourceMap({ Pos, End },
      ...flatten(ifClauses.map(({ ThenPos, Pos, /** ElsePos, FiPos */ }, i) => [
        { key: i === 0 ? 'if' : (i === lastIndex ? 'else' : 'elif'), pos: Pos },
        { key: 'then', pos: ThenPos },
      ])).concat(
        { key: 'fi', pos: FiPos },
      )
    );

    return new IfComposite({
      key: CompositeType.if,
      cs: ifClauses.map<IfPart<Term>>(({ Cond, Pos, ThenPos, Then }, i) => ({
        test: i === lastIndex ? null : this.StmtList(Cond, { Pos, End: ThenPos }),
        child: this.StmtList(Then, { Pos, End: ThenPos }),
      })),
      sourceMap,
    });
  }

  public LetClause({ Pos, End, Let, Exprs }: Sh.LetClause): LetComposite {
    return new LetComposite({
      key: CompositeType.let,
      cs: Exprs.map((Expr) => this.ArithmExpr(Expr) as ArithmOpComposite),
      sourceMap: this.sourceMap({ Pos, End }, {
        key: 'let', pos: Let,
      }),
    });
  }

  public Lit({ Pos, End, Value, /** ValuePos, ValueEnd */ }: Sh.Lit): ExpandComposite {
    return new LiteralExpand({
      key: CompositeType.expand,
      expandKey: ExpandType.literal,
      value: Value,
      sourceMap: this.sourceMap({ Pos, End }),
    });
  }

  public ParamExp(input: Sh.ParamExp): ExpandComposite {
    const { Pos, End, Dollar, Rbrace } = input;
    const { Excl, Exp, Index, Length, Names, Param, Repl, Short, Slice } = input;
    // const { Width } = input;

    const extras: ExtraSourceMap[] = [
      { key: 'dollar', pos: Dollar },
      { key: 'param', pos: Param.Pos, end: Param.End },
    ];
    if (Rbrace.Line) {
      extras.push({ key: 'right-brace', pos: Rbrace });
    }

    // Must assign below.
    let sub = null as null | ParameterDef<
      ExpandComposite,
      ArithmOpComposite | ExpandComposite
    >;
    const base = {
      // subKey: 'parameter' as 'parameter',
      expandKey: ExpandType.parameter as ExpandType.parameter,
      param: Param.Value,
      short: Short,
      index: Index ? this.ArithmExpr(Index) : undefined,
    };

    if (Excl) {// ${!...}
      if (Index) {
        extras.push(
          { key: 'index', pos: Index.Pos },
          { key: 'index', pos: Index.End },
        );
        const special = this.isArithmExprSpecial(Index);
        if (special) {// ${!x[@]}, ${x[*]}
          sub = { ...base, parKey: ParamType['keys'], split: special === '@' };
        } else {// Indirection ${!x[n]} or ${!x["foo"]}.
          sub = sub || { ...base, parKey: ParamType['pointer'] };
        }
      } else if (Names) {// ${!x*}, ${!x@}.
        sub = { ...base, parKey: ParamType['vars'], split: (Names === '@') };
      } else {// Indirection ${!x}.
        sub = { ...base, parKey: ParamType['pointer'] };
      }
    } else {// No exclamation.
      if (Exp) {
        const pattern = Exp.Word ? this.Expand(Exp.Word) : null;
        const alt = pattern;
        switch (Exp.Op) {
          case '^': sub = { ...base, parKey: ParamType.case, pattern, to: 'upper', all: false }; break;
          case '^^': sub = { ...base, parKey: ParamType.case, pattern, to: 'upper', all: true };  break;
          case ',': sub = { ...base, parKey: ParamType.case, pattern, to: 'lower', all: false }; break;
          case ',,': sub = { ...base, parKey: ParamType.case, pattern, to: 'lower', all: true }; break;
          // remove.
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

    const sourceMap = this.sourceMap({ Pos, End }, ...extras);
    return new ParameterExpand({
      key: CompositeType.expand,
      expandKey: ExpandType.parameter,
      ...sub,
      sourceMap,
    });
  }

  public Redirect({ Pos, End, Op, OpPos, N, Word, Hdoc }: Sh.Redirect): RedirectComposite {
    const sourceMap = this.sourceMap({ Pos, End }, { key: 'op', pos: OpPos });
    const base = {
      key: CompositeType.redirect as CompositeType.redirect,
      sourceMap,
    };
    const fd = N ? Number(N.Value) : undefined;
    switch (Op) {
      case '<': {
        return new RedirectComposite({
          ...base,
          subKey: '<', location: this.Expand(Word), mod: null, fd
        });
      }
      case '<&': {
        const [part] = Word.Parts;
        // See 3.6.8 of:
        // https://www.gnu.org/software/bash/manual/bash.html#Redirections
        if (part && part.type === 'Lit' && part.Value.endsWith('-')) {
          return new RedirectComposite({
            ...base,
            subKey: '<', location: this.Expand(Word), mod: 'move', fd,
          });
        }
        return new RedirectComposite({
          ...base,
          subKey: '<', location: this.Expand(Word), mod: 'dup', fd,
        });
      }
      case '>': {
        return new RedirectComposite({
          ...base,
          subKey: '>', location: this.Expand(Word), mod: null, fd,
        });
      }
      case '>>': {
        return new RedirectComposite({
          ...base,
          subKey: '>', location: this.Expand(Word), mod: 'append', fd,
        });
      }
      case '>&': {
        const [part] = Word.Parts;
        if (part && part.type === 'Lit' && part.Value.endsWith('-')) {
          return new RedirectComposite({
            ...base,
            subKey: '>', location: this.Expand(Word), mod: 'move', fd,
          });
        }
        return new RedirectComposite({
          ...base,
          subKey: '>', location: this.Expand(Word), mod: 'dup', fd,
        });
      }
      case '<<': {
        return new RedirectComposite({
          ...base,
          subKey: '<<',
          location: this.Expand(Word),
          fd,
          here: this.Expand(Hdoc as any), // TODO remove any.
        });
      }
      case '<<<': {
        return new RedirectComposite({
          ...base,
          subKey: '<<<', location: this.Expand(Word), fd,
        });
      }
      case '<>': {
        return new RedirectComposite({
          ...base,
          subKey: '<>', location: this.Expand(Word), fd,
        });
      }
      default: throw new Error(`Unsupported redirection symbol '${Op}'.`);
    }
  }

  /**
   * Position equals Pos.
   */
  public Stmt({
    Pos, End, Semicolon, Negated, Comments, Background, Redirs, Cmd,
    // Position,
  }: Sh.Stmt): Term {
    return this.Command(Cmd, {
      Redirs,
      Pos,
      End,
      // Could be ;, & or &|, or undefined when Semicolon.Line is 0.
      extra: Semicolon.Line
        ? [{ key: 'terminator', pos: Semicolon }]
        : [],
      comments: this.comments(Comments),
      background: Background,
      negated: Negated,
    });
  }

  public StmtList(
    { Stmts, Last }: Sh.StmtList,
    { Pos, End }: Sh.BaseNode,
  ): Term {
    return new SeqComposite({
      key: CompositeType.seq,
      cs: Stmts.map((stmt) => this.Stmt(stmt)),
      sourceMap: this.sourceMap({ Pos, End }),
      comments: Last.map<TermComment>(({ Pos, End, Hash, Text }) => ({
        text: '#' + Text,
        sourceMap: this.sourceMap(
          { Pos, End },
          { key: 'hash', pos: Hash }
        ),
      })),
    });
  }

  public Subshell({ Pos, End, Lparen, Rparen, StmtList }: Sh.Subshell): Term {
    return new SubshellComposite({
      key: CompositeType.subshell,
      cs: StmtList.Stmts.map((stmt) => this.Stmt(stmt)),
      sourceMap: this.sourceMap(
        { Pos, End },
        { key: 'paren', pos: Lparen, end: Rparen },
      ),
    });
  }

  public TestClause({
    Pos, End, Left, Right, X,
  }: Sh.TestClause): TestComposite {
    return new TestComposite({
      key: CompositeType.test,
      expr: this.TestExpr(X),
      sourceMap: this.sourceMap(
        { Pos, End },
        { key: '[', pos: Left, end: Right },
      ),
    });
  }

  public TimeClause({ Pos, End, PosixFormat, Stmt, Time }: Sh.TimeClause): Term {
    return new TimeComposite({
      key: CompositeType.time,
      timed: Stmt ? this.Stmt(Stmt) : null,
      posix: PosixFormat,
      sourceMap: this.sourceMap({ Pos, End },
        { key: 'time', pos: Time },
      ),
    });
  }

  public TestExpr(
    input: Sh.TestExpr,
    ...extra: ExtraSourceMap[]
  ): TestOpComposite | ExpandComposite {
    const { Pos, End } = input;

    switch (input.type) {
      case 'BinaryTest': {
        return new TestOpComposite({
          key: CompositeType.test_op,
          cs: [this.TestExpr(input.X), this.TestExpr(input.Y)],
          postfix: false,
          symbol: input.Op,
          sourceMap: this.sourceMap({ Pos, End },
            ...extra,// Earlier first.
            { key: input.Op, pos: input.OpPos },
          ),
        });
      }
      case 'ParenTest': {
        // NOTE we ignore input.{Pos,End}.
        return this.TestExpr(input.X,
          { key: 'parent', pos: input.Lparen, end: input.Rparen },
        );
      }
      case 'UnaryTest': {
        return new TestOpComposite({
          key: CompositeType.test_op,
          cs: [this.TestExpr(input.X)],
          postfix: false, // No post/pre for tests.
          sourceMap: this.sourceMap({ Pos, End },
            ...extra, // Earlier first.
            { key: input.Op, pos: input.OpPos },
          ),
          symbol: input.Op,
        });
      }
      case 'Word': {
        return this.Expand(input);
      }
      default: throw testNever(input);
    }
  }

  public WhileClause(
    { Pos, End, Cond, Do, DonePos, DoPos, WhilePos,
      // Until, 
    }: Sh.WhileClause
  ): WhileIterator {
    const sourceMap = this.sourceMap({ Pos, End },
      { key: 'while', pos: WhilePos },
      { key: 'do', pos: DoPos },
      { key: 'done', pos: DonePos },
    );
    return new WhileIterator({
      key: IteratorType.while,
      guard: this.StmtList(Cond, { Pos: WhilePos, End: DoPos }),
      body: this.StmtList(Do, { Pos: DoPos, End: DonePos }),
      sourceMap,
    });
  }

  public Expand({ Pos, End, Parts }: Sh.Word): ExpandComposite {
    if (Parts.length > 1) {
      return new PartsExpand({
        key: CompositeType.expand,
        expandKey: ExpandType.parts,
        cs: Parts.map((wordPart) => this.ExpandPart(wordPart)),
        sourceMap: this.sourceMap({ Pos, End }),
      });
    }
    return this.ExpandPart(Parts[0]);
  }

  public ExpandPart(input: Sh.WordPart): ExpandComposite {
    const { Pos, End } = input;

    switch (input.type) {
      case 'ArithmExp': {
        return new ArithmExpand({
          key: CompositeType.expand,
          expandKey: ExpandType.arithmetic,
          expr: this.ArithmExpr(input.X),
          sourceMap: this.sourceMap({ Pos, End }),
        });
      }
      case 'CmdSubst': {
        const { Pos, End, StmtList, Left, Right } = input;
        return new CommandExpand({
          key: CompositeType.expand,
          expandKey: ExpandType.command,
          cs: StmtList.Stmts.map((Stmt) => this.Stmt(Stmt)),
          sourceMap: this.sourceMap({ Pos, End },
            // $( ... ) or ` ... `
            { key: 'brackets', pos: Left, end: Right }),
          // Trailing comments only.
          comments: StmtList.Last.map<TermComment>(({ Hash, End, Text }) => ({
            sourceMap: this.sourceMap({ Pos: Hash, End }),
            text: Text,
          })),
        });
      }
      case 'DblQuoted': {
        const { Dollar, Parts } = input;
        return new DoubleQuoteExpand({
          key: CompositeType.expand,
          expandKey: ExpandType.doubleQuote,
          cs: Parts.map((part) => this.ExpandPart(part)),
          locale: Dollar,
          sourceMap: this.sourceMap({ Pos, End }),
          comments: [],
        });
      }
      case 'ExtGlob': {
        return new ExtGlobExpand({
          key: CompositeType.expand,
          expandKey: ExpandType.extendedGlob,
          glob: input.Pattern.Value,
          sourceMap: this.sourceMap({ Pos, End }),
        });
      }
      case 'Lit': {
        return new LiteralExpand({
          key: CompositeType.expand,
          expandKey: ExpandType.literal,
          value: input.Value,
          sourceMap: this.sourceMap({ Pos, End }),
        });
      }
      case 'ParamExp': {
        return this.ParamExp(input);
      }
      case 'ProcSubst': {
        const { Pos, End, StmtList, Op, Rparen } = input;
        return new ProcessExpand({
          key: CompositeType.expand,
          expandKey: ExpandType.process,
          dir: Op === '<(' ? '<' : '>',
          cs: StmtList.Stmts.map((Stmt) => this.Stmt(Stmt)),
          sourceMap: this.sourceMap({ Pos, End },
            { key: 'right-bracket', pos: Rparen }),
          // Trailing comments only.
          comments: StmtList.Last.map<TermComment>(({ Hash, End, Text }) => ({
            sourceMap: this.sourceMap({ Pos: Hash, End }),
            text: Text,
          })),
        });
      }
      case 'SglQuoted': {
        const { Dollar, Left, Right, Value } = input;
        return new SingleQuoteExpand({
          key: CompositeType.expand,
          expandKey: ExpandType.singleQuote,
          interpret: Dollar,
          value: Value,
          sourceMap: this.sourceMap({ Pos, End },
            { key: 'single-quote', pos: Left, end: Right },
          ),
        });
      }
      default: throw testNever(input);
    }
  }

  private isArithmExprSpecial(arithmExpr: null | Sh.ArithmExpr): null | '@' | '*' {
    if (arithmExpr && arithmExpr.type === 'Word' && (arithmExpr.Parts.length === 1) && arithmExpr.Parts[0].type === 'Lit') {
      const { Value } = arithmExpr.Parts[0] as Sh.Lit;
      if (Value === '@') {
        return '@';
      } else if (Value === '*') {
        return '*';
      }
    }
    return null;
  }
  /**
   * `Pos.Line` should always be non-zero,
   * e.g. empty `CallExpr.Semicolon` should've be discarded elsewhere.
   */
  private sourceMap(
    { Pos, End }: Sh.BaseNode,
    ...extra: ExtraSourceMap[]
  ): TermSourceMap {
    return {
      from: this.pos(Pos),
      to: this.pos(End),
      extra: extra.map(({ key, pos, end }) =>
        ({ key, pos: this.pos(pos), end: end ? this.pos(end) : null })
      ),
    };
  }

  private pos(Pos: Sh.Pos): CodePosition {
    return {
      row: Pos.Line,
      col: Pos.Col,
      offset: Pos.Offset,
    };
  }

  private comments(Comments: Sh.Comment[]) {
    return Comments.map<TermComment>(({ Hash, End, Text }) => ({
      sourceMap: this.sourceMap({ Pos: Hash, End }),
      text: Text,
    }));
  }

  /**
   * Find contiguous binary commands, assuming...
   */
  private binaryCmds(
    cmd: Sh.BinaryCmd,
    reverse = false,
  ): Sh.BinaryCmd[] {
    const { X, Y, Op } = cmd;
    if (reverse) {
      if (Y.Cmd && Y.Cmd.type === 'BinaryCmd' && Y.Cmd.Op === Op) {
        return [cmd, ...this.binaryCmds(Y.Cmd)];
      }
      return [cmd];
    }
    if (X.Cmd && X.Cmd.type === 'BinaryCmd' && X.Cmd.Op === Op) {
      return [...this.binaryCmds(X.Cmd), cmd];
    }
    return [cmd];
  }

  /**
   * Collect contiguous if-clauses.
   */
  private collectIfClauses(cmd: Sh.IfClause): Sh.IfClause[] {
    return cmd.Else ? [cmd, ...this.collectIfClauses(cmd.Else)] : [cmd];
  }

}

interface CommandExtension {
  Pos: Sh.Pos;
  End: Sh.Pos;
  Redirs: Sh.Redirect[];
  extra: ExtraSourceMap[];
  comments: TermComment[];
  background: boolean;
  negated: boolean;
}

interface ExtraSourceMap {
  key: string;
  pos: Sh.Pos;
  end?: Sh.Pos;
}
