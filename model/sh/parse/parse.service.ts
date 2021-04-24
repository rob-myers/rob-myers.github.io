import Sh, { syntax } from 'mvdan-sh';
import type * as P from './parse.model';
import { defaultSessionKey, defaultStdInOut } from './parse.model';
import { withParents } from './parse.util';

/**
 * Parse shell code using npm module mvdan-sh.
 */
class ParseShService {

  private mockMeta: P.BaseMeta;
  private mockPos: () => Sh.Pos;

  constructor() {
    this.mockPos = () => ({ Line: () => 1, Col: () => 1, Offset: () => 0} as Sh.Pos);
    this.mockMeta = {
      sessionKey: defaultSessionKey,
      pid: -1,
      ppid: -1,
      pgid: -1,
      fd: {
        0: defaultStdInOut,
        1: defaultStdInOut,
        2: defaultStdInOut,
      },
    };
  }

  /**
   * The input  `partialSrc` must come from the command line.
   * It must be `\n`-terminated.
   * It must not have a proper-prefix which is a complete command,
   * e.g. `echo foo\necho bar\n` invalid via proper-prefix `echo foo\n`.
   */
  private interactiveParse(partialSrc: string): P.InteractiveParseResult {
    const parser = syntax.NewParser();
    let incomplete: null | boolean = null;
    let readCount = 0;

    try {// Detect if code is incomplete or complete
      parser.Interactive(
        { read: () => partialSrc.slice(readCount * 1000, ++readCount * 1000) },
        () => { incomplete = parser.Incomplete(); return false; }
      );
    } catch (e) {
      // Ignore errors due to code being partial and `read` resolving.
    }

    const parsed = incomplete ? null : this.parse(partialSrc);
    return { incomplete, parsed };
  }

  /**
   * Use mvdan-sh to parse shell code.
   */
  parse(src: string): P.FileWithMeta {
    const parser = syntax.NewParser(
      syntax.KeepComments(true),
      syntax.Variant(syntax.LangBash),
      // syntax.Variant(syntax.LangPOSIX),
      // syntax.Variant(syntax.LangMirBSDKorn),
    );
    const parsed = parser.Parse(src, 'src.sh');
    // console.log('mvdan-sh parsed', parsed);
    /**
     * Clean up the parse, making it serialisable.
     * We also use a single fresh `meta` for all nodes, and attach parents.
     */
    const cleaned = this.File(parsed);
    return withParents(cleaned);
  }

  tryParseBuffer(buffer: string[]) {
    // console.log('parsing shell code', buffer.slice());
    try {
      // Parser.Interactive expects terminal newline.
      const src = buffer.join('\n') + '\n';
      const { incomplete, parsed } = this.interactiveParse(src);
      // if (parsed) console.log('parsed shell code', parsed);

      return incomplete
        ? { key: 'incomplete' as 'incomplete' }
        : { key: 'complete' as 'complete', parsed: parsed!, src };

    } catch (e) {
      console.error(e);
      return { key: 'failed' as 'failed', error: `${e.Error()}` };
    }
  }

  /**
   * Convert to a source-code position in our format.
   * It may be invalid e.g. `CallExpr.Semicolon`.
   * This can be inferred because 1-based `Line` will equal `0`.
   */
  private pos = ({ Line, Col, Offset }: Sh.Pos): P.Pos => ({
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
  private base = ({ Pos: _, End:__ }: Sh.BaseNode): P.BaseNode => {
    // console.log({ Pos, End });
    return {
      // Pos: this.pos(Pos()),
      // End: this.pos(End()),
      meta: this.mockMeta, // Gets mutated
      parent: null, // Gets overwritten
    };
  };

  //#region parse-node conversions

  private ArithmCmd = (
    { Pos, End, Left, Right, Unsigned, X }: Sh.ArithmCmd
  ): P.ArithmCmd => ({
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
  ): P.ArithmExp => ({
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
  ): P.ArrayElem => ({
    ...this.base({ Pos, End }),
    type: 'ArrayElem',
    Comments: Comments.map(this.Comment),
    Index: Index ? this.ArithmExpr(Index) : null,
    Value: this.Word(Value),
  });

  private ArithmExpr = (node: Sh.ArithmExpr): P.ArithmExpr => {
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
  ): P.ArrayExpr => ({
    ...this.base({ Pos, End }),
    type: 'ArrayExpr',
    Elems: Elems.map(this.ArrayElem),
    Last: Last.map(this.Comment),
    Lparen: this.pos(Lparen),
    Rparen: this.pos(Rparen),
  });

  private Assign = (
    { Pos, End, Append, Array, Index, Naked, Name, Value }: Sh.Assign
  ): P.Assign => ({
    ...this.base({ Pos, End }),
    type: 'Assign',
    Append,
    Array: Array ? this.ArrayExpr(Array) : null,
    Index: Index ? this.ArithmExpr(Index) : null,
    Naked,
    Name: this.Lit(Name),
    Value: Value ? this.Word(Value) : Value,
    // declOpts: {},
  });

  private BinaryArithm = (
    { Pos, End, Op, OpPos, X, Y }: Sh.BinaryArithm
  ): P.BinaryArithm => ({
    ...this.base({ Pos, End }),
    type: 'BinaryArithm',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    X: this.ArithmExpr(X),
    Y: this.ArithmExpr(Y),
  })
  
  private BinaryCmd = (
    { Pos, End, Op, OpPos, X, Y }: Sh.BinaryCmd
  ): P.BinaryCmd => ({
    ...this.base({ Pos, End }),
    type: 'BinaryCmd',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    X: this.Stmt(X),
    Y: this.Stmt(Y),
  });
  
  private BinaryTest = (
    { Pos, End, Op, OpPos, X, Y }: Sh.BinaryTest,
  ): P.BinaryTest => ({
    ...this.base({ Pos, End }),
    type: 'BinaryTest',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    X: this.TestExpr(X),
    Y: this.TestExpr(Y),
  })

  private Block = (
    { Pos, End, Lbrace, Rbrace, Stmts, Last }: Sh.Block,
  ): P.Block => ({
    ...this.base({ Pos, End }),
    type: 'Block',
    Lbrace: this.pos(Lbrace),
    Rbrace: this.pos(Rbrace),
    Stmts: Stmts.map(Stmt => this.Stmt(Stmt)),
    Last: Last.map(this.Comment),
  });

  private CallExpr = (
    { Pos, End, Args, Assigns }: Sh.CallExpr
  ): P.CallExpr => ({
    ...this.base({ Pos, End }),
    type: 'CallExpr',
    Args: Args.map(this.Word),
    Assigns: Assigns.map(this.Assign),
  });

  private CaseClause = (
    { Pos, End, Case, Esac, Items, Last, Word }: Sh.CaseClause
  ): P.CaseClause => ({
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
      OpPos, Patterns, Stmts }: Sh.CaseItem
  ): P.CaseItem => ({
    ...this.base({ Pos, End }),
    type: 'CaseItem',
    Comments: Comments.map(this.Comment),
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    Patterns: Patterns.map(this.Word),
    Stmts: Stmts.map(Stmt => this.Stmt(Stmt)),
  });
  
  private CmdSubst = (
    { Pos, End, Left, ReplyVar, Right, Stmts, TempFile }: Sh.CmdSubst
  ): P.CmdSubst => ({
    ...this.base({ Pos, End }),
    type: 'CmdSubst',
    Left: this.pos(Left),
    ReplyVar,
    Right: this.pos(Right),
    Stmts: Stmts.map(Stmt => this.Stmt(Stmt)),
    TempFile,
  });
  
  private Comment = (
    { Pos, End, Hash, Text }: Sh.Comment
  ): P.Comment => ({
    ...this.base({ Pos, End }),
    type: 'Comment',
    Hash: this.pos(Hash),
    Text,
  });
  
  private CStyleLoop = (
    { Pos, End, Cond, Init,
      Lparen, Post, Rparen }: Sh.CStyleLoop
  ): P.CStyleLoop => ({
    ...this.base({ Pos, End }),
    type: 'CStyleLoop',
    Cond: this.ArithmExpr(Cond),
    Init: this.ArithmExpr(Init),
    Lparen: this.pos(Lparen),
    Post: this.ArithmExpr(Post),
    Rparen: this.pos(Rparen),
  });
  
  private Command = (node: Sh.Command): P.Command => {
    if ('Args' in node && !('Variant' in node)) {
      return this.CallExpr(node);
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
  ): P.CoprocClause => ({
    ...this.base({ Pos, End }),
    type: 'CoprocClause',
    Coproc: this.pos(Coproc),
    Name: Name ? this.Lit(Name) : null,
    Stmt: this.Stmt(Stmt),
  });
  
  private DblQuoted = (
    { Pos, End, Dollar, Parts, Left, Right }: Sh.DblQuoted
  ): P.DblQuoted => ({
    ...this.base({ Pos, End }),
    type: 'DblQuoted',
    Dollar,
    Parts: Parts.map(this.WordPart),
    Left: this.pos(Left),
    Right: this.pos(Right),
  });
  
  private DeclClause = (
    { Pos, End, Args, Variant }: Sh.DeclClause
  ): P.DeclClause => {
    return {
      ...this.base({ Pos, End }),
      type: 'DeclClause',
      Args: Args.map(this.Assign),
      Variant: this.Lit(Variant),
    };
  };
  
  private ExtGlob = (
    { Pos, End, Op, OpPos, Pattern }: Sh.ExtGlob
  ): P.ExtGlob => ({
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
    { Name, Stmts }: Sh.File,
  ): P.FileWithMeta => ({
    ...this.base({ Pos: this.mockPos, End: this.mockPos }),
    type: 'File',
    Name,
    Stmts: Stmts.map(x => this.Stmt(x)),
    meta: this.mockMeta,
  });
  // ): FileWithMeta => ({
  //   ...this.base({ Pos: this.mockPos, End: this.mockPos }),
  //   type: 'File',
  //   Name,
  //   StmtList: this.StmtList(StmtList),
  //   meta: this.mockMeta,
  // });
  
  private ForClause = (
    { Pos, End, Do, DonePos, DoPos, ForPos, Loop, Select }: Sh.ForClause
  ): P.ForClause => ({
    ...this.base({ Pos, End }),
    type: 'ForClause',
    Do: Do.map(Stmt => this.Stmt(Stmt)),
    DonePos: this.pos(DonePos),
    DoPos: this.pos(DoPos),
    ForPos: this.pos(ForPos),
    Loop: this.Loop(Loop),
    Select,
  });

  private FuncDecl = (
    { Pos, End, Body, Name, Position, RsrvWord }: Sh.FuncDecl
  ): P.FuncDecl => ({
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
  ): P.IfClause => ({
    ...this.base({ Pos, End }),
    type: 'IfClause',
    ThenPos: this.pos(ThenPos),
    FiPos: this.pos(FiPos),

    Cond: Cond.map(Stmt => this.Stmt(Stmt)),
    CondLast: (CondLast || []).map(this.Comment),
    Then: Then.map(Stmt => this.Stmt(Stmt)),
    ThenLast: (ThenLast || []).map(this.Comment),

    Else: Else ? this.IfClause(Else) : null,
    Last: Last.map(this.Comment),
  });

  private LetClause = (
    { Pos, End, Exprs, Let }: Sh.LetClause,
  ): P.LetClause => ({
    ...this.base({ Pos, End }),
    type: 'LetClause',
    Exprs: Exprs.map(this.ArithmExpr),
    Let: this.pos(Let),
  });

  private Lit = <Values extends string = string>(
    { Pos, End, Value, ValueEnd, ValuePos }: Sh.Lit
  ): P.Lit<Values> => ({
    ...this.base({ Pos, End }),
    type: 'Lit',
    Value: Value as Values,
    ValueEnd: this.pos(ValueEnd),
    ValuePos: this.pos(ValuePos),
  });

  private Loop = (node: Sh.Loop): P.Loop => {
    if ('Name' in node) {
      return this.WordIter(node);
    }
    return this.CStyleLoop(node);
  };

  private ParamExp = (
    { Pos, End, Dollar, Excl, Exp,
      Index, Length, Names, Param, Rbrace,
      Repl, Short, Slice, Width }: Sh.ParamExp
  ): P.ParamExp => ({
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
  ): P.ParenArithm => ({
    ...this.base({ Pos, End }),
    type: 'ParenArithm',
    Lparen: this.pos(Lparen),
    Rparen: this.pos(Rparen),
    X: this.ArithmExpr(X),
  });

  private ParenTest = (
    { Pos, End, Lparen, Rparen, X }: Sh.ParenTest
  ): P.ParenTest => ({
    ...this.base({ Pos, End }),
    type: 'ParenTest',
    Lparen: this.pos(Lparen),
    Rparen: this.pos(Rparen),
    X: this.TestExpr(X),
  });

  private ProcSubst = (
    { Pos, End, Op, OpPos, Rparen, Stmts }: Sh.ProcSubst
  ): P.ProcSubst => ({
    ...this.base({ Pos, End }),
    type: 'ProcSubst',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    Rparen: this.pos(Rparen),
    Stmts: Stmts.map(Stmt => this.Stmt(Stmt)),
  });

  private Redirect = (
    { Pos, End, Hdoc, N, Op, OpPos, Word }: Sh.Redirect
  ): P.Redirect => ({
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
  ): P.SglQuoted => ({
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
  ): P.Stmt => ({
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

  private Subshell = (
    { Pos, End, Lparen, Rparen, Stmts }: Sh.Subshell
  ): P.Subshell => ({
    ...this.base({ Pos, End }),
    type: 'Subshell',
    Lparen: this.pos(Lparen),
    Rparen: this.pos(Rparen),
    Stmts: Stmts.map(this.Stmt),
  });

  private TestClause = (
    { Pos, End, Left, Right, X }: Sh.TestClause
  ): P.TestClause => ({
    ...this.base({ Pos, End }),
    type: 'TestClause',
    Left: this.pos(Left),
    Right: this.pos(Right),
    X: this.TestExpr(X),
  });
  
  private TestExpr = (node: Sh.TestExpr): P.TestExpr => {
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
  ): P.TimeClause => ({
    ...this.base({ Pos, End }),
    type: 'TimeClause',
    PosixFormat,
    Stmt: Stmt ? this.Stmt(Stmt) : null,
    Time: this.pos(Time),
  });
  
  private UnaryArithm = (
    { Pos, End, Op, OpPos, Post, X }: Sh.UnaryArithm
  ): P.UnaryArithm => ({
    ...this.base({ Pos, End }),
    type: 'UnaryArithm',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    Post,
    X: this.ArithmExpr(X),
  });

  private UnaryTest = (
    { Pos, End, Op, OpPos, X }: Sh.UnaryTest
  ): P.UnaryTest => ({
    ...this.base({ Pos, End }),
    type: 'UnaryTest',
    Op: this.op(Op),
    OpPos: this.pos(OpPos),
    X: this.TestExpr(X),
  });

  private WhileClause = (
    { Pos, End, Cond, Do, DonePos,
      DoPos, Until, WhilePos }: Sh.WhileClause
  ): P.WhileClause => ({
    ...this.base({ Pos, End }),
    type: 'WhileClause',
    Cond: Cond.map(Stmt => this.Stmt(Stmt)),
    Do: Do.map(Stmt => this.Stmt(Stmt)),
    DonePos: this.pos(DonePos),
    DoPos: this.pos(DoPos),
    Until,
    WhilePos: this.pos(WhilePos),
  });

  private Word = ({ Pos, End, Parts }: Sh.Word): P.Word => ({
    ...this.base({ Pos, End }),
    type: 'Word',
    Parts: Parts.map(this.WordPart),
  });
  
  private WordIter = (
    { Pos, End, Items, Name }: Sh.WordIter
  ): P.WordIter => ({
    ...this.base({ Pos, End }),
    type: 'WordIter',
    Items: Items.map(this.Word),
    Name: this.Lit(Name),
  });

  private WordPart = (node: Sh.WordPart): P.WordPart => {
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
    } else if ('Stmts' in node) {
      return this.ProcSubst(node);
    }
    return this.ExtGlob(node);
  };
  //#endregion

  /**
   * https://github.com/mvdan/sh/blob/fdf7a3fc92bd63ca6bf0231df97875b8613c0a8a/syntax/tokens.go
   */
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
    { name: 'tilde', value: '~' },
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

export const parseService = new ParseShService();

export type ParseService = ParseShService;