import Sh, { syntax } from 'mvdan-sh';
import cloneWithRefs from 'lodash.clonedeep';
import { withParents } from './parse.util';
// console.log({ Sh });

/**
 * Parse shell code using npm module mvdan-sh.
 */
class ParseShService {

  private mockMeta = getMockMeta();
  private mockPos = getMockPos();

  public parse(src: string): FileWithMeta {
    // Use mvdan-sh to parse shell code
    const parser = syntax.NewParser();
    syntax.KeepComments(parser);
    const parsed = parser.Parse(src, 'src.sh');
    /**
     * Clean up the parse, making it serialisable.
     * We also use a single fresh `meta` for all nodes,
     * and attach parents.
     */
    this.mockMeta = getMockMeta();
    const cleaned = this.File(parsed);
    return withParents(cleaned);
  }

  public tryParseBuffer(buffer: string[]) {
    console.log('PARSING', buffer.slice()); // DEBUG
    try {
      // Parser.Interactive expects terminal newline.
      const src = buffer.join('\n') + '\n';
      const { incomplete, parsed } = this.interactiveParse(src);

      if (parsed) {// DEBUG
        parsed.StmtList.Stmts.forEach((stmt) => console.log('PARSED', stmt.Cmd));
      }

      return incomplete
        ? { key: 'incomplete' as 'incomplete' }
        : { key: 'complete' as 'complete', parsed: parsed!, src };

    } catch (e) {
      console.error(e);
      return { key: 'failed' as 'failed', error: `${e}` };
    }
  }

  /**
   * `partialSrc` must come from the command line.
   * It must be `\n`-terminated.
   * It must not have a proper-prefix which is a complete command,
   * e.g. `echo foo\necho bar\n` invalid via proper-prefix `echo foo\n`.
   */
  public interactiveParse(partialSrc: string): InteractiveParseResult {
    const parser = syntax.NewParser();
    let incomplete: null | boolean = null;

    try { // Use mvdah-sh to parse partial shell code
      parser.Interactive(
        { read: () => partialSrc },
        () => { incomplete = parser.Incomplete(); return false; }
      );
    } catch (e) {
      // console.log('ERROR', e);
    }

    // To clean it up we re-parse, which also provides source map
    const parsed = incomplete ? null : this.parse(partialSrc);
    return { incomplete, parsed };
  }

  public clone(parsed: FileWithMeta): FileWithMeta {
    const cloned = cloneWithRefs(parsed);
    Object.assign(cloned.meta, getMockMeta());
    return cloned;
  }

  /**
   * Convert to a source-code position in our format.
   * It may be invalid e.g. `CallExpr.Semicolon`.
   * This can be inferred because 1-based `Line` will equal `0`.
   */
  private pos = ({ Line, Col, Offset }: Sh.Pos): Pos => ({
    Line: Line(),
    Col: Col(),
    Offset: Offset(),
  });

  /**
   * Convert numeric operator to string.
   */
  private op(opIndex: number): string {
    const meta = this.opMetas[opIndex];
    // console.log({ opIndex, meta });
    return meta.value || meta.name;
  }

  /** Convert to our notion of base parsed node. */
  private base = ({ Pos, End }: Sh.BaseNode): BaseNode => {
    // console.log({ Pos, End });
    return {
      Pos: this.pos(Pos()),
      End: this.pos(End()),
      meta: this.mockMeta, // Gets mutated
      parent: null, // Gets overwritten
    };
  };

  //#region parse-node conversions

  private ArithmCmd = (
    { Pos, End, Left, Right, Unsigned, X }: Sh.ArithmCmd
  ): ArithmCmd => ({
    ...this.base({ Pos, End }),
    type: 'ArithmCmd',
    Left: this.pos(Left),
    Right: this.pos(Right),
    Unsigned,
    X: this.ArithmExpr(X),
  });

  private ArithmExp = (
    { Pos, End, Bracket, Left,
      Right, Unsigned, X }: Sh.ArithmExp
  ): ArithmExp => ({
    ...this.base({ Pos, End }),
    type: 'ArithmExp',
    Bracket,
    Left: this.pos(Left),
    Right: this.pos(Right),
    Unsigned,
    X: this.ArithmExpr(X),
  });

  private ArrayElem = (
    { Pos, End, Comments, Index, Value }: Sh.ArrayElem
  ): ArrayElem => ({
    ...this.base({ Pos, End }),
    type: 'ArrayElem',
    Comments: Comments.map(this.Comment),
    Index: Index ? this.ArithmExpr(Index) : null,
    Value: this.Word(Value),
  });

  private ArithmExpr = (node: Sh.ArithmExpr): ArithmExpr => {
    if ('Y' in node) {
      return this.BinaryArithm(node);
    } else if ('Post' in node) {
      return this.UnaryArithm(node);
    } else if ('Lparen' in node) {
      return this.ParenArithm(node);
    }
    return this.Word(node);
  }

  private ArrayExpr = (
    { Pos, End, Elems, Last, Lparen, Rparen }: Sh.ArrayExpr
  ): ArrayExpr => ({
    ...this.base({ Pos, End }),
    type: 'ArrayExpr',
    Elems: Elems.map(this.ArrayElem),
    Last: Last.map(this.Comment),
    Lparen: this.pos(Lparen),
    Rparen: this.pos(Rparen),
  });

  private Assign = (
    { Pos, End, Append, Array, Index, Naked, Name, Value }: Sh.Assign
  ): Assign => ({
    ...this.base({ Pos, End }),
    type: 'Assign',
    Append,
    Array: Array ? this.ArrayExpr(Array) : null,
    Index: Index ? this.ArithmExpr(Index) : null,
    Naked,
    Name: this.Lit(Name),
    Value: Value ? this.Word(Value) : Value,
  });

  private BinaryArithm = (
    { Pos, End, Op, OpPos, X, Y }: Sh.BinaryArithm
  ): BinaryArithm => ({
    ...this.base({ Pos, End }),
    type: 'BinaryArithm',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    X: this.ArithmExpr(X),
    Y: this.ArithmExpr(Y),
  })
  
  private BinaryCmd = (
    { Pos, End, Op, OpPos, X, Y }: Sh.BinaryCmd
  ): BinaryCmd => ({
    ...this.base({ Pos, End }),
    type: 'BinaryCmd',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    X: this.Stmt(X),
    Y: this.Stmt(Y),
  });
  
  private BinaryTest = (
    { Pos, End, Op, OpPos, X, Y }: Sh.BinaryTest,
  ): BinaryTest => ({
    ...this.base({ Pos, End }),
    type: 'BinaryTest',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    X: this.TestExpr(X),
    Y: this.TestExpr(Y),
  })

  private Block = (
    { Pos, End, Lbrace, Rbrace, StmtList }: Sh.Block,
  ): Block => ({
    ...this.base({ Pos, End }),
    type: 'Block',
    Lbrace: this.pos(Lbrace),
    Rbrace: this.pos(Rbrace),
    StmtList: this.StmtList(StmtList),
  });

  private CallExpr = (
    { Pos, End, Args, Assigns }: Sh.CallExpr
  ): CallExpr => ({
    ...this.base({ Pos, End }),
    type: 'CallExpr',
    Args: Args.map(this.Word),
    Assigns: Assigns.map(this.Assign),
  });

  private CaseClause = (
    { Pos, End, Case, Esac, Items, Last, Word }: Sh.CaseClause
  ): CaseClause => ({
    ...this.base({ Pos, End }),
    type: 'CaseClause',
    Case: this.pos(Case),
    Esac: this.pos(Esac),
    Items: Items.map(this.CaseItem),
    Last: Last.map(this.Comment),
    Word: this.Word(Word),
  });

  private CaseItem = (
    { Pos, End, Comments, Op,
      OpPos, Patterns, StmtList }: Sh.CaseItem
  ): CaseItem => ({
    ...this.base({ Pos, End }),
    type: 'CaseItem',
    Comments: Comments.map(this.Comment),
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    Patterns: Patterns.map(this.Word),
    StmtList: this.StmtList(StmtList),
  });
  
  private CmdSubst = (
    { Pos, End, Left, ReplyVar, Right,
      StmtList, TempFile }: Sh.CmdSubst
  ): CmdSubst => ({
    ...this.base({ Pos, End }),
    type: 'CmdSubst',
    Left: this.pos(Left),
    ReplyVar,
    Right: this.pos(Right),
    StmtList: this.StmtList(StmtList),
    TempFile,
  });
  
  private Comment = (
    { Pos, End, Hash, Text }: Sh.Comment
  ): Comment => ({
    ...this.base({ Pos, End }),
    type: 'Comment',
    Hash: this.pos(Hash),
    Text,
  });
  
  private CStyleLoop = (
    { Pos, End, Cond, Init,
      Lparen, Post, Rparen }: Sh.CStyleLoop
  ): CStyleLoop => ({
    ...this.base({ Pos, End }),
    type: 'CStyleLoop',
    Cond: this.ArithmExpr(Cond),
    Init: this.ArithmExpr(Init),
    Lparen: this.pos(Lparen),
    Post: this.ArithmExpr(Post),
    Rparen: this.pos(Rparen),
  });
  
  private Command = (node: Sh.Command): Command => {
    if ('Args' in node) {
      return this.CallExpr(node);
    // } else if ('IfPos' in node) {
    } else if ('FiPos' in node) {
      return this.IfClause(node);
    } else if  ('WhilePos' in node) {
      return this.WhileClause(node);
    } else if ('ForPos' in node) {
      return this.ForClause(node);
    } else if ('Case' in node) {
      return this.CaseClause(node);
    } else if ('Lbrace' in node) {
      return this.Block(node);
    } else if ('Lparen' in node) {
      return this.Subshell(node);
    } else if ('Y' in node) {
      return this.BinaryCmd(node);
    } else if ('Body' in node) {
      return this.FuncDecl(node);
    } else if ('Unsigned' in node) {
      return this.ArithmCmd(node);
    } else if ('X' in node) {
      return this.TestClause(node);
    } else if ('Variant' in node) {
      return this.DeclClause(node);
    } else if ('Let' in node) {
      return this.LetClause(node);
    } else if ('Time' in node) {
      return this.TimeClause(node);
    }
    return this.CoprocClause(node);
  };
  
  private CoprocClause = (
    { Pos, End, Coproc, Name, Stmt }: Sh.CoprocClause
  ): CoprocClause => ({
    ...this.base({ Pos, End }),
    type: 'CoprocClause',
    Coproc: this.pos(Coproc),
    Name: Name ? this.Lit(Name) : null,
    Stmt: this.Stmt(Stmt),
  });
  
  private DblQuoted = (
    { Pos, End, Dollar, Parts, Position }: Sh.DblQuoted
  ): DblQuoted => ({
    ...this.base({ Pos, End }),
    type: 'DblQuoted',
    Dollar,
    Parts: Parts.map(this.WordPart),
    Position: this.pos(Position),
  });
  
  /**
   * ISSUE
   * - ambiguity i.e. `declare $x` views latter as assignment,
   *   yet could denote an option.
   * - this.Assign is being sent a var without a name, and complains.
   */
  private DeclClause = (
    { Pos, End, Assigns, Opts, Variant }: Sh.DeclClause
  ): DeclClause => {
  // ): CallExpr => {
    /**
     * PATCH.
     * - Move assigns with null `Name` into `others`, using `Value`.
     * - Move assigns whose `Name` starts with -/+ into `options`, using `Name`.
     */
    const AssignsPatched = Assigns.filter((x) => x.Name && !/^[-+]/.test(x.Name.Value));
    const others = Assigns.filter((x) => !x.Name).map(({ Value }) => Value as Sh.Word);
    const OptsPatched = Opts.concat(
      Assigns.filter((x) => x.Name && /^[-+]/.test(x.Name.Value))
        .map<Sh.Word>((x) => ({ type: 'Word', Parts: [x.Name], Pos: x.Pos, End: x.End }))
    );
    return {
      ...this.base({ Pos, End }),
      type: 'DeclClause',
      Assigns: AssignsPatched.map(this.Assign),
      Opts: OptsPatched.map(this.Word),
      Variant: this.Lit(Variant),
      others: others.map(this.Word),// PATCH.
    };
  };
  
  private ExtGlob = (
    { Pos, End, Op, OpPos, Pattern }: Sh.ExtGlob
  ): ExtGlob => ({
    ...this.base({ Pos, End }),
    type: 'ExtGlob',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    Pattern: this.Lit(Pattern),
  });

  /**
   * Previously arg had functions {Pos} and {End}.
   */
  private File = (
    { Name, StmtList }: Sh.File,
  ): FileWithMeta => ({
    ...this.base({ Pos: this.mockPos, End: this.mockPos }),
    type: 'File',
    Name,
    StmtList: this.StmtList(StmtList),
    meta: this.mockMeta,
  });
  
  private ForClause = (
    { Pos, End, Do, DonePos, DoPos, ForPos, Loop, Select }: Sh.ForClause
  ): ForClause => ({
    ...this.base({ Pos, End }),
    type: 'ForClause',
    Do: this.StmtList(Do),
    DonePos: this.pos(DonePos),
    DoPos: this.pos(DoPos),
    ForPos: this.pos(ForPos),
    Loop: this.Loop(Loop),
    Select,
  });

  private FuncDecl = (
    { Pos, End, Body, Name, Position, RsrvWord }: Sh.FuncDecl
  ): FuncDecl => ({
    ...this.base({ Pos, End }),
    type: 'FuncDecl',
    Body: this.Stmt(Body),
    Name: this.Lit(Name),
    Position: this.pos(Position),
    RsrvWord,
  });

  private IfClause = (
    { Pos, End, Cond, CondLast, Else,
      FiPos, Then, ThenLast, ThenPos, Last }: Sh.IfClause
  ): IfClause => ({
    ...this.base({ Pos, End }),
    type: 'IfClause',
    ThenPos: this.pos(ThenPos),
    FiPos: this.pos(FiPos),

    Cond: this.StmtList(Cond),
    CondLast: (CondLast || []).map(this.Comment),
    Then: this.StmtList(Then),
    ThenLast: (ThenLast || []).map(this.Comment),

    Else: Else ? this.IfClause(Else) : null,
    Last: Last.map(this.Comment),
  });

  private LetClause = (
    { Pos, End, Exprs, Let }: Sh.LetClause,
  ): LetClause => ({
    ...this.base({ Pos, End }),
    type: 'LetClause',
    Exprs: Exprs.map(this.ArithmExpr),
    Let: this.pos(Let),
  });

  private Lit = <Values extends string = string>(
    { Pos, End, Value, ValueEnd, ValuePos }: Sh.Lit
  ): Lit<Values> => ({
    ...this.base({ Pos, End }),
    type: 'Lit',
    Value: Value as Values,
    ValueEnd: this.pos(ValueEnd),
    ValuePos: this.pos(ValuePos),
  });

  private Loop = (node: Sh.Loop): Loop => {
    if ('Name' in node) {
      return this.WordIter(node);
    }
    return this.CStyleLoop(node);
  };

  private ParamExp = (
    { Pos, End, Dollar, Excl, Exp,
      Index, Length, Names, Param, Rbrace,
      Repl, Short, Slice, Width }: Sh.ParamExp
  ): ParamExp => ({
    ...this.base({ Pos, End }),
    type: 'ParamExp',
    Dollar: this.pos(Dollar),
    Excl,
    Exp: Exp ? {
      type: 'Expansion',
      Op: this.op(Exp.Op),
      Word: Exp.Word ? this.Word(Exp.Word) : null,
    } : null,
    Index: Index ? this.ArithmExpr(Index) : null,
    Length,
    Names: Names ? this.op(Names) : null,
    Param: this.Lit(Param),
    Rbrace: this.pos(Rbrace),
    Repl: Repl ? {
      type: 'Replace',
      All: Repl.All,
      Orig: this.Word(Repl.Orig),
      With: Repl.With ? this.Word(Repl.With) : null,
    } : null,
    Short,
    Slice: Slice ? {
      type: 'Slice',
      Length: Slice.Length ? this.ArithmExpr(Slice.Length) : null,
      Offset: this.ArithmExpr(Slice.Offset),
    } : null,
    Width,
  });

  private ParenArithm = (
    { Pos, End, Lparen, Rparen, X }: Sh.ParenArithm
  ): ParenArithm => ({
    ...this.base({ Pos, End }),
    type: 'ParenArithm',
    Lparen: this.pos(Lparen),
    Rparen: this.pos(Rparen),
    X: this.ArithmExpr(X),
  });

  private ParenTest = (
    { Pos, End, Lparen, Rparen, X }: Sh.ParenTest
  ): ParenTest => ({
    ...this.base({ Pos, End }),
    type: 'ParenTest',
    Lparen: this.pos(Lparen),
    Rparen: this.pos(Rparen),
    X: this.TestExpr(X),
  });

  private ProcSubst = (
    { Pos, End, Op, OpPos, Rparen, StmtList }: Sh.ProcSubst
  ): ProcSubst => ({
    ...this.base({ Pos, End }),
    type: 'ProcSubst',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    Rparen: this.pos(Rparen),
    StmtList: this.StmtList(StmtList),
  });

  private Redirect = (
    { Pos, End, Hdoc, N, Op, OpPos, Word }: Sh.Redirect
  ): Redirect => ({
    ...this.base({ Pos, End }),
    type: 'Redirect',
    Hdoc: Hdoc ? this.Word(Hdoc) : null,
    N: N ? this.Lit(N) : null,
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    Word: this.Word(Word),
  });

  private SglQuoted = (
    { Pos, End, Dollar, Left, Right, Value }: Sh.SglQuoted
  ): SglQuoted => ({
    ...this.base({ Pos, End }),
    type: 'SglQuoted',
    Dollar,
    Left: this.pos(Left),
    Right: this.pos(Right),
    Value,
  });

  private Stmt = (
    { Pos, End, Background, Cmd, Comments, Coprocess,
      Negated, Position, Redirs, Semicolon }: Sh.Stmt
  ): Stmt => ({
    ...this.base({ Pos, End }),
    type: 'Stmt',
    Background,
    Cmd: Cmd
      ? this.Command(Cmd)
      : null,
    Comments: Comments.map(this.Comment),
    Coprocess,
    Negated,
    Position: this.pos(Position),
    Redirs: Redirs.map(this.Redirect),
    Semicolon: this.pos(Semicolon),
  });

  private StmtList = (
    { Last, Stmts }: Sh.StmtList
  ): StmtList => ({
    // Force every node to have a parent
    ...this.base({ Pos: this.mockPos, End: this.mockPos }),
    type: 'StmtList',
    Last: Last.map(this.Comment),
    Stmts: Stmts.map(this.Stmt),
  });

  private Subshell = (
    { Pos, End, Lparen, Rparen, StmtList }: Sh.Subshell
  ): Subshell => ({
    ...this.base({ Pos, End }),
    type: 'Subshell',
    Lparen: this.pos(Lparen),
    Rparen: this.pos(Rparen),
    StmtList: this.StmtList(StmtList),
  });

  private TestClause = (
    { Pos, End, Left, Right, X }: Sh.TestClause
  ): TestClause => ({
    ...this.base({ Pos, End }),
    type: 'TestClause',
    Left: this.pos(Left),
    Right: this.pos(Right),
    X: this.TestExpr(X),
  });
  
  private TestExpr = (node: Sh.TestExpr): TestExpr => {
    if ('Y' in node) {
      return this.BinaryTest(node);
    } else if ('Op' in node) {
      return this.UnaryTest(node);
    } else if ('X' in node) {
      return this.ParenTest(node);
    }
    return this.Word(node);
  };

  private TimeClause = (
    { Pos, End, PosixFormat, Stmt, Time }: Sh.TimeClause
  ): TimeClause => ({
    ...this.base({ Pos, End }),
    type: 'TimeClause',
    PosixFormat,
    Stmt: Stmt ? this.Stmt(Stmt) : null,
    Time: this.pos(Time),
  });
  
  private UnaryArithm = (
    { Pos, End, Op, OpPos, Post, X }: Sh.UnaryArithm
  ): UnaryArithm => ({
    ...this.base({ Pos, End }),
    type: 'UnaryArithm',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    Post,
    X: this.ArithmExpr(X),
  });

  private UnaryTest = (
    { Pos, End, Op, OpPos, X }: Sh.UnaryTest
  ): UnaryTest => ({
    ...this.base({ Pos, End }),
    type: 'UnaryTest',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    X: this.TestExpr(X),
  });

  private WhileClause = (
    { Pos, End, Cond, Do, DonePos,
      DoPos, Until, WhilePos }: Sh.WhileClause
  ): WhileClause => ({
    ...this.base({ Pos, End }),
    type: 'WhileClause',
    Cond: this.StmtList(Cond),
    Do: this.StmtList(Do),
    DonePos: this.pos(DonePos),
    DoPos: this.pos(DoPos),
    Until,
    WhilePos: this.pos(WhilePos),
  });

  private Word = ({ Pos, End, Parts }: Sh.Word): Word => ({
    ...this.base({ Pos, End }),
    type: 'Word',
    Parts: Parts.map(this.WordPart),
  });
  
  private WordIter = (
    { Pos, End, Items, Name }: Sh.WordIter
  ): WordIter => ({
    ...this.base({ Pos, End }),
    type: 'WordIter',
    Items: Items.map(this.Word),
    Name: this.Lit(Name),
  });

  private WordPart = (node: Sh.WordPart): WordPart => {
    if ('ValuePos' in node) {
      return this.Lit(node);
    } else if ('Value' in node) {
      return this.SglQuoted(node);
    } else if ('Parts' in node) {
      return this.DblQuoted(node);
    } else if ('Slice' in node) {
      return this.ParamExp(node);
    } else if ('TempFile' in node) {
      return this.CmdSubst(node);
    } else if ('X' in node) {
      return this.ArithmExp(node);
    } else if ('StmtList' in node) {
      return this.ProcSubst(node);
    }
    return this.ExtGlob(node);
  };
  //#endregion

  private readonly opMetas: {
    name: string;
    value: null | string;
  }[] = [
    { name: 'illegalTok', value: null },// 0
    { name: '_EOF', value: null },
    { name: '_Newl', value: null },
    { name: '_Lit', value: null },
    { name: '_LitWord', value: null },
    { name: '_LitRedir', value: null },
    { name: 'sglQuote', value: '\'' },
    { name: 'dblQuote', value: '"' },
    { name: 'bckQuote', value: '`' },
    { name: 'and', value: '&' },
    { name: 'andAnd', value: '&&' },// 10
    { name: 'orOr', value: '||' },
    { name: 'or', value: '|' },
    { name: 'orAnd', value: '|&' },
    { name: 'dollar', value: '$' },
    { name: 'dollSglQuote', value: '$\'' },
    { name: 'dollDblQuote', value: '$"' },
    { name: 'dollBrace', value: '${' },
    { name: 'dollBrack', value: '$[' },
    { name: 'dollParen', value: '$(' },
    { name: 'dollDblParen', value: '$((' },
    { name: 'leftBrack', value: '[' },
    { name: 'dblLeftBrack', value: '[[' },
    { name: 'leftParen', value: '(' },
    { name: 'dblLeftParen', value: '((' },
    { name: 'rightBrace', value: '}' },
    { name: 'rightBrack', value: ']' },
    { name: 'rightParen', value: ')' },
    { name: 'dblRightParen', value: '))' },
    { name: 'semicolon', value: ';' },
    { name: 'dblSemicolon', value: ';;' },
    { name: 'semiAnd', value: ';&' },
    { name: 'dblSemiAnd', value: ';;&' },
    { name: 'semiOr', value: ';|' },
    { name: 'exclMark', value: '!' },
    { name: 'addAdd', value: '++' },
    { name: 'subSub', value: '--' },
    { name: 'star', value: '*' },
    { name: 'power', value: '**' },
    { name: 'equal', value: '==' },
    { name: 'nequal', value: '!=' },
    { name: 'lequal', value: '<=' },
    { name: 'gequal', value: '>=' },
    { name: 'addAssgn', value: '+=' },
    { name: 'subAssgn', value: '-=' },
    { name: 'mulAssgn', value: '*=' },
    { name: 'quoAssgn', value: '/=' },
    { name: 'remAssgn', value: '%=' },
    { name: 'andAssgn', value: '&=' },
    { name: 'orAssgn', value: '|=' },
    { name: 'xorAssgn', value: '^=' },
    { name: 'shlAssgn', value: '<<=' },
    { name: 'shrAssgn', value: '>>=' },
    { name: 'rdrOut', value: '>' },
    { name: 'appOut', value: '>>' },
    { name: 'rdrIn', value: '<' },
    { name: 'rdrInOut', value: '<>' },
    { name: 'dplIn', value: '<&' },
    { name: 'dplOut', value: '>&' },
    { name: 'clbOut', value: '>|' },
    { name: 'hdoc', value: '<<' },
    { name: 'dashHdoc', value: '<<-' },
    { name: 'wordHdoc', value: '<<<' },
    { name: 'rdrAll', value: '&>' },
    { name: 'appAll', value: '&>>' },
    { name: 'cmdIn', value: '<(' },
    { name: 'cmdOut', value: '>(' },
    { name: 'plus', value: '+' },
    { name: 'colPlus', value: ':+' },
    { name: 'minus', value: '-' },
    { name: 'colMinus', value: ':-' },
    { name: 'quest', value: '?' },
    { name: 'colQuest', value: ':?' },
    { name: 'assgn', value: '=' },
    { name: 'colAssgn', value: ':=' },// Param expansion.
    { name: 'perc', value: '%' },
    { name: 'dblPerc', value: '%%' },// Param expansion.
    { name: 'hash', value: '#' },// Param expansion.
    { name: 'dblHash', value: '##' },// Param expansion.
    { name: 'caret', value: '^' },
    { name: 'dblCaret', value: '^^' },// Param expansion.
    { name: 'comma', value: ',' },
    { name: 'dblComma', value: ',,' },
    { name: 'at', value: '@' },
    { name: 'slash', value: '/' },
    { name: 'dblSlash', value: '//' },
    { name: 'colon', value: ':' },
    { name: 'tsExists', value: '-e' },
    { name: 'tsRegFile', value: '-f' },
    { name: 'tsDirect', value: '-d' },
    { name: 'tsCharSp', value: '-c' },
    { name: 'tsBlckSp', value: '-b' },
    { name: 'tsNmPipe', value: '-p' },
    { name: 'tsSocket', value: '-S' },
    { name: 'tsSmbLink', value: '-L' },
    { name: 'tsSticky', value: '-k' },
    { name: 'tsGIDSet', value: '-g' },
    { name: 'tsUIDSet', value: '-u' },
    { name: 'tsGrpOwn', value: '-G' },
    { name: 'tsUsrOwn', value: '-O' },
    { name: 'tsModif', value: '-N' },
    { name: 'tsRead', value: '-r' },
    { name: 'tsWrite', value: '-w' },
    { name: 'tsExec', value: '-x' },
    { name: 'tsNoEmpty', value: '-s' },
    { name: 'tsFdTerm', value: '-t' },
    { name: 'tsEmpStr', value: '-z' },
    { name: 'tsNempStr', value: '-n' },
    { name: 'tsOptSet', value: '-o' },
    { name: 'tsVarSet', value: '-v' },
    { name: 'tsRefVar', value: '-R' },
    { name: 'tsReMatch', value: '=~' },
    { name: 'tsNewer', value: '-nt' },
    { name: 'tsOlder', value: '-ot' },
    { name: 'tsDevIno', value: '-ef' },
    { name: 'tsEql', value: '-eq' },
    { name: 'tsNeq', value: '-ne' },
    { name: 'tsLeq', value: '-le' },
    { name: 'tsGeq', value: '-ge' },
    { name: 'tsLss', value: '-lt' },
    { name: 'tsGtr', value: '-gt' },
    { name: 'globQuest', value: '?(' },
    { name: 'globStar', value: '*(' },
    { name: 'globPlus', value: '+(' },
    { name: 'globAt', value: '@(' },
    { name: 'globExcl', value: '!(' },
  ];
}

//#region typings

// export type ParseResult = File;

/**
 * Our notion of position, as opposed to `MvdanSh.Pos`.
 */
export interface Pos {
  Line: number;
  Col: number;
  Offset: number;
}
/**
 * Our notion of base node, as opposed to `MvdanSh.BaseNode`.
 */
export interface BaseNode {
  End: Pos;
  Pos: Pos;
  meta: FileMeta; // Single instance for entire tree
  /** Reference to parent node  */
  parent: null | ParsedSh;
  /** Used for test expansion */
  boolean?: boolean;
  /** Used for arithmetic expansion */
  number?: number;
  /** Used for arithmetic/boolean expansion */
  string?: string;
  exitCode?: number;
}

export type ParsedSh = (
  | ArithmCmd
  | ArithmExp
  | ArrayElem
  | ArithmExpr
  | ArrayExpr
  | Assign
  | BinaryArithm
  | BinaryCmd
  | BinaryTest
  | Block
  | CallExpr
  | CaseClause
  | CaseItem
  | CmdSubst
  | Comment
  | CStyleLoop
  | Command
  | CoprocClause
  | DblQuoted
  | DeclClause
  | ExtGlob
  | File
  | ForClause
  | FuncDecl
  | IfClause
  | LetClause
  | Lit
  | Loop
  | ParamExp
  | ParenArithm
  | ParenTest
  | ProcSubst
  | Redirect
  | SglQuoted
  | Stmt
  | StmtList
  | Subshell
  | TestClause
  | TimeClause
  | TestExpr
  | UnaryArithm
  | UnaryTest
  | WhileClause
  | Word
  | WordIter
  | WordPart
);

export type ExpandType = (
  | ArithmExpr
  | Word // i.e. parts
  | Exclude<WordPart, ArithmExp>
);

export type ArithmCmd = Sh.ArithmCmdGeneric<BaseNode, Pos, string>
export type ArithmExp = Sh.ArithmExpGeneric<BaseNode, Pos, string>
export type ArrayElem = Sh.ArrayElemGeneric<BaseNode, Pos, string>
export type ArithmExpr =
| BinaryArithm
| UnaryArithm
| ParenArithm
| Word
export type ArrayExpr = Sh.ArrayExprGeneric<BaseNode, Pos, string>
export type Assign = Sh.AssignGeneric<BaseNode, Pos, string>
export type BinaryArithm = Sh.BinaryArithmGeneric<BaseNode, Pos, string>
export type BinaryCmd = Sh.BinaryCmdGeneric<BaseNode, Pos, string>
export type BinaryTest = Sh.BinaryTestGeneric<BaseNode, Pos, string>
export type Block = Sh.BlockGeneric<BaseNode, Pos, string>
export type CallExpr = Sh.CallExprGeneric<BaseNode, Pos, string>
export type CaseClause = Sh.CaseClauseGeneric<BaseNode, Pos, string>
export type CaseItem = Sh.CaseItemGeneric<BaseNode, Pos, string>
export type CmdSubst = Sh.CmdSubstGeneric<BaseNode, Pos, string>
export type Comment = Sh.CommentGeneric<BaseNode, Pos, string>
export type CStyleLoop = Sh.CStyleLoopGeneric<BaseNode, Pos, string>
export type Command =
| CallExpr
| IfClause
| WhileClause
| ForClause
| CaseClause
| Block
| Subshell
| BinaryCmd
| FuncDecl
| ArithmCmd
| TestClause
| DeclClause
| LetClause
| TimeClause
| CoprocClause
export type CoprocClause = Sh.CoprocClauseGeneric<BaseNode, Pos, string>
export type DblQuoted = Sh.DblQuotedGeneric<BaseNode, Pos, string>
export type DeclClause = Sh.DeclClauseGeneric<BaseNode, Pos, string>
export type ExtGlob = Sh.ExtGlobGeneric<BaseNode, Pos, string>
export type File = Sh.FileGeneric<BaseNode, Pos, string> & BaseNode
export type ForClause = Sh.ForClauseGeneric<BaseNode, Pos, string>
export type FuncDecl = Sh.FuncDeclGeneric<BaseNode, Pos, string>
export type IfClause = Sh.IfClauseGeneric<BaseNode, Pos, string>
export type LetClause = Sh.LetClauseGeneric<BaseNode, Pos, string>
export type Lit<Values extends string = string> = Sh.LitGeneric<BaseNode, Pos, number, Values>
export type Loop =
| WordIter
| CStyleLoop
export type ParamExp = Sh.ParamExpGeneric<BaseNode, Pos, string>
export type ParenArithm = Sh.ParenArithmGeneric<BaseNode, Pos, string>
export type ParenTest = Sh.ParenTestGeneric<BaseNode, Pos, string>
export type ProcSubst = Sh.ProcSubstGeneric<BaseNode, Pos, string>
export type Redirect = Sh.RedirectGeneric<BaseNode, Pos, string>
export type SglQuoted = Sh.SglQuotedGeneric<BaseNode, Pos, string>
export type Stmt = Sh.StmtGeneric<BaseNode, Pos, string>
export type StmtList = Sh.StmtListGeneric<BaseNode, Pos, string>
export type Subshell = Sh.SubshellGeneric<BaseNode, Pos, string>
export type TestClause = Sh.TestClauseGeneric<BaseNode, Pos, string>
export type TimeClause = Sh.TimeClauseGeneric<BaseNode, Pos, string>
export type TestExpr =
| BinaryTest
| UnaryTest
| ParenTest
| Word
export type UnaryArithm = Sh.UnaryArithmGeneric<BaseNode, Pos, string>
export type UnaryTest = Sh.UnaryTestGeneric<BaseNode, Pos, string>
export type WhileClause = Sh.WhileClauseGeneric<BaseNode, Pos, string>
export type Word = Sh.WordGeneric<BaseNode, Pos, string>
export type WordIter = Sh.WordIterGeneric<BaseNode, Pos, string>
export type WordPart =
| Lit
| SglQuoted
| DblQuoted
| ParamExp
| CmdSubst
| ArithmExp
| ProcSubst
| ExtGlob

//#endregion

export interface InteractiveParseResult {
  /**
   * `parser.Interactive` callback appears to
   * run synchronously. Permit null just in case.
   */
  incomplete: boolean | null;
  /** If `incomplete` is false, this is the cleaned parse. */
  parsed: null | FileWithMeta;
}

export interface FileWithMeta extends File {
  meta: FileMeta;
}
export interface FileMeta {
  pid: number;
  /** This is a shell iff `pid === sid` */
  sid: number;
  sessionKey: string;
}
const getMockMeta = (): FileMeta => ({
  pid: -1,
  sid: -1,
  sessionKey: 'mockSession',
});

const getMockPos = () => (() => ({
  Line: () => 1,
  Col: () => 1,
  Offset: () => 0,
} as Sh.Pos));

export const parseSh = new ParseShService();
