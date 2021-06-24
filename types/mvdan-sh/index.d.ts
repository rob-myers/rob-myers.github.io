declare namespace MvdanSh {

  namespace syntax {
    /**
     * NewParser allocates a new `Parser` and applies any number of options.
     * - Hack to turn on `keepComments`:
     * `parser['Parser'].__internal_object__.keepComments = true`
     */
    function NewParser(...opts: any[]): MvdanSh.Parser;
    /**
     * Given a node returns its type e.g. `'Assign'` or `'Comment'`.
     */
    function NodeType(node: MvdanSh.Node): MvdanSh.NodeType;

    function NewPrinter(): MvdanSh.Printer;
    function DebugPrint(): void; // Return value?

    function Walk(
      /** Initial node. */
      node: MvdanSh.Node,
      /**
       * This predicate is recursively applied in a
       * depth-first fashion. It should return true
       * iff traversal should continue.
       */
      predicate: (node: MvdanSh.Node) => boolean,
    ): void;

    function KeepComments(enabled?: boolean): any;
    function Variant(variant: 0 | 1 | 2): any;
    const LangBash: 0;
    const LangPOSIX: 1;
    const LangMirBSDKorn: 2;
  }

  interface Parser {
    Parse(
      /** Source code e.g. `echo 'Hello, world!'`. */
      src: string,
      /** Name of file e.g. `src.sh`. */
      filename: string,
    ): MvdanSh.File;

    Interactive(
      /**
       * `null` means EOF.
       */
      src: { read: (size?: number) => string | null },
      pred: (stmts: MvdanSh.Stmt[]) => boolean,
    ): void;

    Incomplete(): boolean;
  }

  /**
   * Union
   */
  type Node = GenericNode<MvdanSh.BaseNode, MvdanSh.Pos, MvdanSh.Op>;

  /**
   * Every parse node extends `BaseNode`.
   */
  interface BaseNode {
    /**
     * Pos returns the position of the first character of the node. Comments
     * are ignored, except if the node is a *File.
     */
    End(): MvdanSh.Pos;
    /**
     * End returns the position of the character immediately after the node.
     * If the character is a newline, the line number won't cross into the
     * next line. Comments are ignored, except if the node is a *File.
     */
    Pos(): MvdanSh.Pos;
  }
  /**
   * Operators e.g. '|&' are represented by numbers.
   */
  type Op = number;

  type ArithmCmd = ArithmCmdGeneric<BaseNode, Pos, Op>
  type ArithmExp = ArithmExpGeneric<BaseNode, Pos, Op>
  type ArithmExpr =
  | BinaryArithm
  | UnaryArithm
  | ParenArithm
  | Word
  type ArrayElem = ArrayElemGeneric<BaseNode, Pos, Op>
  type ArrayExpr = ArrayExprGeneric<BaseNode, Pos, Op>
  type Assign = AssignGeneric<BaseNode, Pos, Op>
  type BinaryArithm = BinaryArithmGeneric<BaseNode, Pos, Op>
  type BinaryCmd = BinaryCmdGeneric<BaseNode, Pos, Op>
  type BinaryTest = BinaryTestGeneric<BaseNode, Pos, Op>
  type Block = BlockGeneric<BaseNode, Pos, Op>
  type CallExpr = CallExprGeneric<BaseNode, Pos, Op>
  type CaseClause = CaseClauseGeneric<BaseNode, Pos, Op>
  type CaseItem = CaseItemGeneric<BaseNode, Pos, Op>
  type CmdSubst = CmdSubstGeneric<BaseNode, Pos, Op>
  type Comment = CommentGeneric<BaseNode, Pos, Op>
  type CStyleLoop = CStyleLoopGeneric<BaseNode, Pos, Op>
  type Command =
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
  type CoprocClause = CoprocClauseGeneric<BaseNode, Pos, Op>
  type DblQuoted = DblQuotedGeneric<BaseNode, Pos, Op>
  type DeclClause = DeclClauseGeneric<BaseNode, Pos, Op>
  type ExtGlob = ExtGlobGeneric<BaseNode, Pos, Op>
  type File = FileGeneric<BaseNode, Pos, Op>
  // type File = FileGeneric<{}, Pos, Op>
  type ForClause = ForClauseGeneric<BaseNode, Pos, Op>
  type FuncDecl = FuncDeclGeneric<BaseNode, Pos, Op>
  type IfClause = IfClauseGeneric<BaseNode, Pos, Op>
  type LetClause = LetClauseGeneric<BaseNode, Pos, Op>
  type Lit<Values extends string = string> = LitGeneric<BaseNode, Pos, Op, Values>
  type Loop =
  | WordIter
  | CStyleLoop
  type ParamExp = ParamExpGeneric<BaseNode, Pos, Op>
  type ParenArithm = ParenArithmGeneric<BaseNode, Pos, Op>
  type ParenTest = ParenTestGeneric<BaseNode, Pos, Op>
  type ProcSubst = ProcSubstGeneric<BaseNode, Pos, Op>
  type Redirect = RedirectGeneric<BaseNode, Pos, Op>
  type SglQuoted = SglQuotedGeneric<BaseNode, Pos, Op>
  type Stmt = StmtGeneric<BaseNode, Pos, Op>
  type Subshell = SubshellGeneric<BaseNode, Pos, Op>
  type TestClause = TestClauseGeneric<BaseNode, Pos, Op>
  type TimeClause = TimeClauseGeneric<BaseNode, Pos, Op>
  type TestExpr =
  | BinaryTest
  | UnaryTest
  | ParenTest
  | Word
  type UnaryArithm = UnaryArithmGeneric<BaseNode, Pos, Op>
  type UnaryTest = UnaryTestGeneric<BaseNode, Pos, Op>
  type WhileClause = WhileClauseGeneric<BaseNode, Pos, Op>
  type Word = WordGeneric<BaseNode, Pos, Op>
  type WordIter = WordIterGeneric<BaseNode, Pos, Op>
  type WordPart =
  | Lit
  | SglQuoted
  | DblQuoted
  | ParamExp
  | CmdSubst
  | ArithmExp
  | ProcSubst
  | ExtGlob

  type GenericNode<Base, Pos, Op> =
  | ArithmCmdGeneric<Base, Pos, Op>
  | ArithmExpGeneric<Base, Pos, Op>
  | ArrayElemGeneric<Base, Pos, Op>
  | ArithmExprGeneric<Base, Pos, Op>
  | ArrayExprGeneric<Base, Pos, Op>
  | AssignGeneric<Base, Pos, Op>
  | BinaryArithmGeneric<Base, Pos, Op>
  | BinaryCmdGeneric<Base, Pos, Op>
  | BinaryTestGeneric<Base, Pos, Op>
  | BlockGeneric<Base, Pos, Op>
  | CallExprGeneric<Base, Pos, Op>
  | CaseClauseGeneric<Base, Pos, Op>
  | CaseItemGeneric<Base, Pos, Op>
  | CmdSubstGeneric<Base, Pos, Op>
  | CStyleLoopGeneric<Base, Pos, Op>
  | CommentGeneric<Base, Pos, Op>
  | CommandGeneric<Base, Pos, Op>
  | CoprocClauseGeneric<Base, Pos, Op>
  | DblQuotedGeneric<Base, Pos, Op>
  | DeclClauseGeneric<Base, Pos, Op>
  | ExtGlobGeneric<Base, Pos, Op>
  | FileGeneric<Base, Pos, Op>
  | ForClauseGeneric<Base, Pos, Op>
  | FuncDeclGeneric<Base, Pos, Op>
  | IfClauseGeneric<Base, Pos, Op>
  | LetClauseGeneric<Base, Pos, Op>
  | LitGeneric<Base, Pos, Op>
  | LoopGeneric<Base, Pos, Op>
  | ParamExpGeneric<Base, Pos, Op>
  | ParenArithmGeneric<Base, Pos, Op>
  | ParenTestGeneric<Base, Pos, Op>
  | ProcSubstGeneric<Base, Pos, Op>
  | RedirectGeneric<Base, Pos, Op>
  | SglQuotedGeneric<Base, Pos, Op>
  | StmtGeneric<Base, Pos, Op>
  | SubshellGeneric<Base, Pos, Op>
  | TestClauseGeneric<Base, Pos, Op>
  | TimeClauseGeneric<Base, Pos, Op>
  | UnaryArithmGeneric<Base, Pos, Op>
  | UnaryTestGeneric<Base, Pos, Op>
  | WhileClauseGeneric<Base, Pos, Op>
  | WordGeneric<Base, Pos, Op>
  | WordIterGeneric<Base, Pos, Op>
  | WordPartGeneric<Base, Pos, Op>
  
  type NodeType =
  | 'ArithmCmd'
  | 'ArithmExp'
  | 'ArrayElem'
  | 'ArrayExpr'
  | 'Assign'
  | 'BinaryArithm'
  | 'BinaryCmd'
  | 'BinaryTest'
  | 'Block'
  | 'CallExpr'
  | 'CaseClause'
  | 'CaseItem'
  | 'CmdSubst'
  | 'CStyleLoop'
  | 'Comment'
  | 'CoprocClause'
  | 'DblQuoted'
  | 'DeclClause'
  | 'ExtGlob'
  | 'File'
  | 'ForClause'
  | 'FuncDecl'
  | 'IfClause'
  | 'LetClause'
  | 'Lit'
  | 'Loop'
  | 'ParamExp'
  | 'ParenArithm'
  | 'ParenTest'
  | 'ProcSubst'
  | 'Redirect'
  | 'SglQuoted'
  | 'Stmt'
  | 'Subshell'
  | 'TestClause'
  | 'TimeClause'
  | 'UnaryArithm'
  | 'UnaryTest'
  | 'WhileClause'
  | 'Word'
  | 'WordIter'

  interface Printer {
    /**
     * Print "pretty-prints" the given syntax tree node to the given writer. Writes to w are buffered.
     * The node types supported at the moment are *File, *Stmt, *Word, and any Command node. A trailing newline will only be printed when a *File is used.
     */
    Print(node: Node): string;
  }

  /**
   * ArithmCmd represents an arithmetic command.
   * This node will only appear in LangBash and LangMirBSDKorn.
   * e.g `(( x = 2, y = ${x} ** 10 ))`.
   */
  type ArithmCmdGeneric<Base, Pos, Op> = Base & {
    type: 'ArithmCmd';
    Left: Pos;
    Right: Pos;
    /** mksh's ((# expr)) */
    Unsigned: boolean; // mksh's ((# expr))
    X: ArithmExprGeneric<Base, Pos, Op>;
  }
  /**
   * ArithmExp represents an arithmetic expansion.
   * e.g. part of `x=$(( 2 ** 10 ))`.
   */
  type ArithmExpGeneric<Base, Pos, Op> = Base & {
    type: 'ArithmExp';
    Left: Pos;
    Right: Pos;
    /** deprecated $[expr] form. */
    Bracket: boolean; // deprecated $[expr] form
    /** mksh's $((# expr)) */
    Unsigned: boolean; // mksh's $((# expr))
    X: ArithmExprGeneric<Base, Pos, Op>;
  }
  /**
   * ArithmExpr represents all nodes that form arithmetic expressions.
   * These are `BinaryArithm`, `UnaryArithm`, `ParenArithm`, and `Word`.
   */
  type ArithmExprGeneric<Base, Pos, Op> =
  | BinaryArithmGeneric<Base, Pos, Op>
  | UnaryArithmGeneric<Base, Pos, Op>
  | ParenArithmGeneric<Base, Pos, Op>
  | WordGeneric<Base, Pos, Op>
  /**
   * ArrayElem represents a Bash array element.
   */
  type ArrayElemGeneric<Base, Pos, Op> = Base & {
    type: 'ArrayElem';
    /** [i]=, ["k"]= */
    Index: null | ArithmExprGeneric<Base, Pos, Op>;
    Value: WordGeneric<Base, Pos, Op>;
    Comments: CommentGeneric<Base, Pos, Op>[];
  }
  /**
   * ArrayExpr represents a Bash array expression.
   * This node will only appear with LangBash.
   */
  type ArrayExprGeneric<Base, Pos, Op> = Base & {
    type: 'ArrayExpr';
    Lparen: Pos;
    Rparen: Pos;
    Elems: ArrayElemGeneric<Base, Pos, Op>[];
    Last: CommentGeneric<Base, Pos, Op>[];
  }
  /**
   * Assign represents an assignment to a variable.
   * Here and elsewhere, Index can mean either an index expression into an indexed array, or a string key into an associative array.
   * If Index is non-nil, the value will be a word and not an array as nested arrays are not allowed.
   * If Naked is true and Name is nil, the assignment is part of a DeclClause and the assignment expression (in the Value field) will be evaluated at run-time.
   */
  type AssignGeneric<Base, Pos, Op> = Base & {
    type: 'Assign';
    /** += */
    Append: boolean;
    /** without '=' */
    Naked: boolean;
    /**
     * Variable name.
     */
    Name: LitGeneric<Base, Pos, Op>;
    /**
     * [i], ["k"]
     */
    Index: null | ArithmExprGeneric<Base, Pos, Op>;
    /**
     * Non-null iff value exists, e.g. doesn't in `local x`.
     */
    Value: null | WordGeneric<Base, Pos, Op>;
    /**
     * Non-null iff `x=(arr)`.
     */
    Array: null | ArrayExprGeneric<Base, Pos, Op>;
  }
  /**
   * BinaryArithm represents a binary arithmetic expression.
   * If Op is any assign operator, X will be a word with a single *Lit whose value is a valid name.
   * Ternary operators like "a ? b : c" are fit into this structure. Thus, if Op==Quest, Y will be a *BinaryArithm with Op==Colon. Op can only be Colon in that scenario.
   */
  type BinaryArithmGeneric<Base, Pos, Op> = Base & {
    type: 'BinaryArithm';
    OpPos: Pos;
    Op: Op;
    X: ArithmExprGeneric<Base, Pos, Op>;
    Y: ArithmExprGeneric<Base, Pos, Op>;
  }
  /**
   * BinaryCmd represents a binary expression between two statements.
   */
  type BinaryCmdGeneric<Base, Pos, Op> = Base & {
    type: 'BinaryCmd';
    OpPos: Pos;
    Op: Op;
    X: StmtGeneric<Base, Pos, Op>;
    Y: StmtGeneric<Base, Pos, Op>;
  }
  /**
   * BinaryTest represents a binary test expression.
   */
  type BinaryTestGeneric<Base, Pos, Op> = Base & {
    type: 'BinaryTest';
    OpPos: Pos;
    Op: Op;
    X: TestExprGeneric<Base, Pos, Op>;
    Y: TestExprGeneric<Base, Pos, Op>;
  }
  /**
   * Block represents a series of commands that should be executed in a nested scope.
   */
  type BlockGeneric<Base, Pos, Op> = Base & {
    type: 'Block';
    Lbrace: Pos;
    Rbrace: Pos;
    Stmts: StmtGeneric<Base, Pos, Op>[];
    Last: CommentGeneric<Base, Pos, Op>[];
  }
  /**
   * CallExpr represents a command execution or function call, otherwise known as a "simple command".
   * If Args is empty, Assigns apply to the shell environment. Otherwise, they are variables that cannot be arrays and which only apply to the call.
   */
  type CallExprGeneric<Base, Pos, Op> = Base & {
    type: 'CallExpr';
    /** a=x b=y args */
    Assigns: AssignGeneric<Base, Pos, Op>[]; // a=x b=y args
    Args: WordGeneric<Base, Pos, Op>[];
  }
  /**
   * CaseClause represents a case (switch) clause.
   */
  type CaseClauseGeneric<Base, Pos, Op> = Base & {
    type: 'CaseClause';
    Case: Pos;
    Esac: Pos;
    Word: WordGeneric<Base, Pos, Op>;
    Items: CaseItemGeneric<Base, Pos, Op>[];
    Last: CommentGeneric<Base, Pos, Op>[];
  }
  /**
   * CaseItem represents a pattern list (case) within a CaseClause.
   */
  type CaseItemGeneric<Base, Pos, Op> = Base & {
    type: 'CaseItem';
    Op: Op;
    /** unset if it was finished by "esac" */
    OpPos: Pos; // unset if it was finished by "esac"
    Comments: CommentGeneric<Base, Pos, Op>[];
    /**
     * `met*|meet*)` yields two patterns.
     */
    Patterns: WordGeneric<Base, Pos, Op>[];
    Stmts: StmtGeneric<Base, Pos, Op>[];
  }
  /**
   * CmdSubst represents a command substitution.
   */
  type CmdSubstGeneric<Base, Pos, Op> = Base & {
    type: 'CmdSubst';
    Left: Pos;
    Right: Pos;
    /** mksh's ${ foo;} */
    TempFile: boolean; // mksh's ${ foo;}
    /** mksh's ${|foo;} */
    ReplyVar: boolean; // mksh's ${|foo;}
    Stmts: StmtGeneric<Base, Pos, Op>[];
  }
  /**
   * Comment represents a single comment on a single line.
   */
  type CommentGeneric<Base, Pos, Op> = Base & {
    type: 'Comment';
    Hash: Pos;
    Text: string;
  }
  /**
   * CStyleLoop represents the behaviour of a for clause similar to the C language.
   * This node will only appear with LangBash.
   */
  type CStyleLoopGeneric<Base, Pos, Op> = Base & {
    type: 'CStyleLoop';
    Lparen: Pos;
    Rparen: Pos;
    Init: ArithmExprGeneric<Base, Pos, Op>;
    Cond: ArithmExprGeneric<Base, Pos, Op>;
    Post: ArithmExprGeneric<Base, Pos, Op>;
  }
  /**
   * Command represents all nodes that are simple or compound commands, including function declarations.
   * These are `CallExpr`, `IfClause`, `WhileClause`, `ForClause`, `CaseClause`, `Block`, `Subshell`, `BinaryCmd`, `FuncDecl`, `ArithmCmd`, `TestClause`, `DeclClause`, `LetClause`, `TimeClause`, and `CoprocClause`.
   */
  type CommandGeneric<Base, Pos, Op> =
  | CallExprGeneric<Base, Pos, Op>
  | IfClauseGeneric<Base, Pos, Op>
  | WhileClauseGeneric<Base, Pos, Op>
  | ForClauseGeneric<Base, Pos, Op>
  | CaseClauseGeneric<Base, Pos, Op>
  | BlockGeneric<Base, Pos, Op>
  | SubshellGeneric<Base, Pos, Op>
  | BinaryCmdGeneric<Base, Pos, Op>
  | FuncDeclGeneric<Base, Pos, Op>
  | ArithmCmdGeneric<Base, Pos, Op>
  | TestClauseGeneric<Base, Pos, Op>
  | DeclClauseGeneric<Base, Pos, Op>
  | LetClauseGeneric<Base, Pos, Op>
  | TimeClauseGeneric<Base, Pos, Op>
  | CoprocClauseGeneric<Base, Pos, Op>

  /**
   * CoprocClause represents a Bash coproc clause.
   * This node will only appear with LangBash.
   */
  type CoprocClauseGeneric<Base, Pos, Op> = Base & {
    type: 'CoprocClause';
    Coproc: Pos;
    Name: null | LitGeneric<Base, Pos, Op>;
    Stmt: StmtGeneric<Base, Pos, Op>;
  }
  /**
   * DblQuoted represents a list of nodes within double quotes.
   */
  type DblQuotedGeneric<Base, Pos, Op> = Base & {
    type: 'DblQuoted';
    Left: Pos;
    Right: Pos;
    /**
     * $"" i.e. locale translation.
     * https://www.gnu.org/software/bash/manual/html_node/Locale-Translation.html
     */
    Dollar: boolean; // $""
    Parts: WordPartGeneric<Base, Pos, Op>[];
  }
  /**
   * DeclClause represents a Bash declare clause.
   * This node will only appear with LangBash.
   */
  type DeclClauseGeneric<Base, Pos, Op> = Base & {
    type: 'DeclClause';
    /**
     * Variant is one of "declare", "local", "export", "readonly",
     * "typeset", or "nameref".
     */
    Variant: LitGeneric<Base, Pos, Op, DeclClauseLitValues>;
    Args: AssignGeneric<Base, Pos, Op>[];
  }
  type DeclClauseLitValues =
  | 'declare'
  | 'local'
  | 'export'
  | 'readonly'
  | 'typeset'
  | 'nameref'
  /**
   * Expansion represents string manipulation in a ParamExp other than those covered by Replace.
   */
  type Expansion<Base, Pos, Op> = {
    type: 'Expansion';
    Op: Op;
    Word: null | WordGeneric<Base, Pos, Op>;
  }
  /**
   * ExtGlob represents a Bash extended globbing expression.
   * Note that these are parsed independently of whether shopt has been called or not.
   * This node will only appear in LangBash and LangMirBSDKorn.
   */
  type ExtGlobGeneric<Base, Pos, Op> = Base & {
    type: 'ExtGlob';
    OpPos: Pos;
    Op: Op;
    Pattern: LitGeneric<Base, Pos, Op>;
  }
  /**
   * File represents a shell source file.
   * No longer has {Pos} and {End} fields.
   */
  // type FileGeneric<Base, Pos, Op> = Base & {
  type FileGeneric<Base, Pos, Op> = {
    type: 'File';
    Name: string;
    Stmts: StmtGeneric<Base, Pos, Op>[];
  }
  /**
   * ForClause represents a for or a select clause. The latter is only present in Bash.
   */
  type ForClauseGeneric<Base, Pos, Op> = Base & {
    type: 'ForClause';
    ForPos: Pos;
    DoPos: Pos;
    DonePos: Pos;
    Select: boolean;
    Loop: LoopGeneric<Base, Pos, Op>;
    Do: StmtGeneric<Base, Pos, Op>[];
  }
  /**
   * FuncDecl represents the declaration of a function.
   */
  type FuncDeclGeneric<Base, Pos, Op> = Base & {
    type: 'FuncDecl';
    Position: Pos;
    /**
     * Using `function foo()` style?
     */
    RsrvWord: boolean; // non-posix "function f()" style
    Name: LitGeneric<Base, Pos, Op>;
    Body: StmtGeneric<Base, Pos, Op>;
  }
  /**
   * IfClause represents an if statement.
   */
  type IfClauseGeneric<Base, Pos, Op> = Base & {
    type: 'IfClause';
    /** Position of "then", empty if this is an "else". */
    ThenPos: Pos;
    /** position of "fi", shared with .Else if non-nil. */
    FiPos: Pos; // position of "fi", empty if Elif == true

    Cond: StmtGeneric<Base, Pos, Op>[];
    CondLast: CommentGeneric<Base, Pos, Op>[];
    Then: StmtGeneric<Base, Pos, Op>[];
    ThenLast: CommentGeneric<Base, Pos, Op>[];

    /** if non-nil, an "elif" or an "else" */
    Else: null | IfClauseGeneric<Base, Pos, Op>;
    /** comments on the first "elif", "else", or "fi" */
    Last: CommentGeneric<Base, Pos, Op>[];
  }
  /**
   * LetClause represents a Bash let clause.
   * This node will only appear in LangBash and LangMirBSDKorn.
   */
  type LetClauseGeneric<Base, Pos, Op> = Base & {
    type: 'LetClause';
    Let: Pos;
    Exprs: ArithmExprGeneric<Base, Pos, Op>[];
  }
  /**
   * `Lit` represents a string literal.
   * Note that a parsed string literal may not appear as-is in the original source code, as it is possible to split literals by escaping newlines. The splitting is lost, but the end position is not.
   */
  type LitGeneric<Base, Pos, Op, Values extends string = string> = Base & {
    type: 'Lit';
    ValuePos: Pos;
    ValueEnd: Pos;
    Value: Values;
  }
  /**
   * Loop holds either `WordIter` or `CStyleLoop`.
   */
  type LoopGeneric<Base, Pos, Op> =
  | WordIterGeneric<Base, Pos, Op>
  | CStyleLoopGeneric<Base, Pos, Op>
  /**
   * ParamExp represents a parameter expansion.
   */
  type ParamExpGeneric<Base, Pos, Op> = Base & {
    type: 'ParamExp';
    Dollar: Pos;
    Rbrace: Pos;
    Short: boolean; // $a instead of ${a}
    Excl: boolean; // ${!a}
    Length: boolean; // ${#a}
    Width: boolean; // ${%a}
    Param: LitGeneric<Base, Pos, Op>;
    /**
     * Non-null iff `${a[i]}, ${a["k"]}`.
     */
    Index: null | ArithmExprGeneric<Base, Pos, Op>;
    /**
     * Non-null iff `${a:x:y}`.
     */
    Slice: null | Slice<Base, Pos, Op>;
    /**
     * Non-null iff `${a/x/y}`.
     */
    Repl: null | Replace<Base, Pos, Op>;
    /**
     * Non-null iff `${!prefix*}` or `${!prefix@}`.
     */
    Names: null | Op;
    /**
     * Non-null iff `${a:-b}`, `${a#b}`, etc.
     */
    Exp: null | Expansion<Base, Pos, Op>;
  }
  /**
   * ParenArithm represents an arithmetic expression within parentheses.
   */
  type ParenArithmGeneric<Base, Pos, Op> = Base & {
    type: 'ParenArithm';
    Lparen: Pos;
    Rparen: Pos;
    X: ArithmExprGeneric<Base, Pos, Op>;
  }
  /**
   * ParenTest represents a test expression within parentheses.
   */
  type ParenTestGeneric<Base, Pos, Op> = Base & {
    type: 'ParenTest';
    Lparen: Pos;
    Rparen: Pos;
    X: TestExprGeneric<Base, Pos, Op>;
  }
  /**
   * Pos is a position within a shell source file.
   */
  interface Pos {
    type: 'Pos';
    /**
     * After reports whether this position p is after p2. It is a more expressive version of p.Offset() > p2.Offset().
     */
    After(p2: Pos): boolean;
    /**
     * Col returns the column number of the position, starting at 1. It counts in bytes.
     */
    Col(): number;
    /**
     * IsValid reports whether the position is valid. All positions in nodes returned by Parse are valid.
     */
    IsValid(): boolean;
    /**
     * Line returns the line number of the position, starting at 1.
     */
    Line(): number;
    /**
     * Offset returns the byte offset of the position in the original source file. Byte offsets start at 0.
     */
    Offset(): number;
    String(): string; 
  }
  /**
   * ProcSubst represents a Bash process substitution.
   * This node will only appear in LangBash.
   */
  type ProcSubstGeneric<Base, Pos, Op> = Base & {
    type: 'ProcSubst';
    OpPos: Pos;
    Rparen: Pos;
    Op: Op;
    Stmts: StmtGeneric<Base, Pos, Op>[];
  }
  /**
   * Redirect represents an input/output redirection.
   */
  type RedirectGeneric<Base, Pos, Op> = Base & {
    type: 'Redirect';
    OpPos: Pos;
    Op: Op;
    /**
     * Non-null iff fd>, or {varname}> in Bash.
     */
    N: null | LitGeneric<Base, Pos, Op>;
    /**
     * >word.
     */
    Word: WordGeneric<Base, Pos, Op>; // >word
    /**
     * Non-null iff here-document body
     */
    Hdoc: null | WordGeneric<Base, Pos, Op>;
  }
  /**
   * Replace represents a search and replace expression inside a ParamExp.
   */
  type Replace<Base, Pos, Op> = {
    type: 'Replace';
    All: boolean;
    Orig: WordGeneric<Base, Pos, Op>;
    With: null | WordGeneric<Base, Pos, Op>;
  }
  /**
   * SglQuoted represents a string within single quotes.
   */
  type SglQuotedGeneric<Base, Pos, Op> = Base & {
    type: 'SglQuoted';
    Left: Pos;
    Right: Pos;
    Dollar: boolean; // $''
    Value: string;
  }
  /**
   * Slice represents a character slicing expression inside a ParamExp.
   * This node will only appear in LangBash and LangMirBSDKorn.
   */
  type Slice<Base, Pos, Op> = {
    type: 'Slice';
    Offset: ArithmExprGeneric<Base, Pos, Op>;
    Length: null | ArithmExprGeneric<Base, Pos, Op>;
  }
  /**
   * Stmt represents a statement, also known as a "complete command". It is compromised of a command and other components that may come before or after it.
   */
  type StmtGeneric<Base, Pos, Op> = Base & {
    type: 'Stmt';
    Comments: CommentGeneric<Base, Pos, Op>[];
    /**
     * null if e.g. `>foo`.
     */
    Cmd: null | CommandGeneric<Base, Pos, Op>;
    Position: Pos;
    /** Position of `;`, `&`, or `|&`, if any. */
    Semicolon: Pos;  // position of ';', '&', or '|&', if any
    /** `true` iff have prefix `!` */
    Negated: boolean; // ! stmt
    /** `true` iff have postfix `&` */
    Background: boolean; // stmt &
    /** mksh's |& */
    Coprocess: boolean; // mksh's |&
    /** stmt >a <b */
    Redirs: RedirectGeneric<Base, Pos, Op>[]; // stmt >a <b
  }
  /**
   * Subshell represents a series of commands that should be executed in a nested shell environment.
   */
  type SubshellGeneric<Base, Pos, Op> = Base & {
    type: 'Subshell';
    Lparen: Pos;
    Rparen: Pos;
    Stmts: StmtGeneric<Base, Pos, Op>[];
  }
  /**
   * TestClause represents a Bash extended test clause.
   * This node will only appear in LangBash and LangMirBSDKorn.
   */
  type TestClauseGeneric<Base, Pos, Op> = Base & {
    type: 'TestClause';
    Left: Pos;
    Right: Pos;
    X: TestExprGeneric<Base, Pos, Op>;
  }
  /**
   * TimeClause represents a Bash time clause. PosixFormat corresponds to the -p flag.
   * This node will only appear in LangBash and LangMirBSDKorn.
   */
  type TimeClauseGeneric<Base, Pos, Op> = Base & {
    type: 'TimeClause';
    Time: Pos;
    PosixFormat: boolean;
    Stmt: null | StmtGeneric<Base, Pos, Op>;
  }
  /**
   * TestExpr represents all nodes that form test expressions.
   * These are `BinaryTest`, `UnaryTest`, `ParenTest`, and `Word`.
   */
  type TestExprGeneric<Base, Pos, Op> =
  | BinaryTestGeneric<Base, Pos, Op>
  | UnaryTestGeneric<Base, Pos, Op>
  | ParenTestGeneric<Base, Pos, Op>
  | WordGeneric<Base, Pos, Op>

  /**
   * UnaryArithm represents an unary arithmetic expression.
   * The unary opearator may come before or after the sub-expression.
   * If Op is Inc or Dec, X will be a word with a single *Lit whose value is a valid name.
   */
  type UnaryArithmGeneric<Base, Pos, Op> = Base & {
    type: 'UnaryArithm';
    OpPos: Pos;
    Op: Op;
    Post: boolean;
    X: ArithmExprGeneric<Base, Pos, Op>;
  }
  /**
   * UnaryTest represents a unary test expression.
   * The unary opearator may come before or after the sub-expression.
   */
  type UnaryTestGeneric<Base, Pos, Op> = Base & {
    type: 'UnaryTest';
    OpPos: Pos;
    Op: Op;
    X: TestExprGeneric<Base, Pos, Op>;
  }
  /**
   * WhileClause represents a while or an until clause.
   */
  type WhileClauseGeneric<Base, Pos, Op> = Base & {
    type: 'WhileClause';
    WhilePos: Pos;
    DoPos: Pos;
    DonePos: Pos;
    Until: boolean;
    Cond: StmtGeneric<Base, Pos, Op>[];
    Do: StmtGeneric<Base, Pos, Op>[];
  }
  /**
   * Word represents a shell word, containing one or more word parts contiguous to each other.
   * The word is delimited by word boundaries, such as spaces, newlines, semicolons, or parentheses.
   */
  type WordGeneric<Base, Pos, Op> = Base & {
    type: 'Word';
    Parts: WordPartGeneric<Base, Pos, Op>[];
    /**
     * ExpandBraces performs Bash brace expansion on a word
     * For example, passing it a single-literal word "foo{bar,baz}"
     * will return two single-literal words, "foobar" and "foobaz".
     * Deprecated: use mvdan.cc/sh/expand.Braces instead.
     *
     * Optional to permit serialization.
     */
    ExpandBraces?(): WordGeneric<Base, Pos, Op>[];
  }
  /**
   * WordIter represents the iteration of a variable over a series of words in a for clause.
   */
  type WordIterGeneric<Base, Pos, Op> = Base & {
    type: 'WordIter';
    Name: LitGeneric<Base, Pos, Op>;
    Items: WordGeneric<Base, Pos, Op>[];
  }
  /**
   * WordPart represents all nodes that can form part of a word.
   * These are `Lit`, `SglQuoted`, `DblQuoted`, `ParamExp`, `CmdSubst`, `ArithmExp`, `ProcSubst`, and `ExtGlob`.
   */
  type WordPartGeneric<Base, Pos, Op> =
  | LitGeneric<Base, Pos, Op>
  | SglQuotedGeneric<Base, Pos, Op>
  | DblQuotedGeneric<Base, Pos, Op>
  | ParamExpGeneric<Base, Pos, Op>
  | CmdSubstGeneric<Base, Pos, Op>
  | ArithmExpGeneric<Base, Pos, Op>
  | ProcSubstGeneric<Base, Pos, Op>
  | ExtGlobGeneric<Base, Pos, Op>

}

declare module 'mvdan-sh' {
  export = MvdanSh;
}
