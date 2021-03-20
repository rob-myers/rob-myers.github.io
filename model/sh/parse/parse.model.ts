import type Sh from 'mvdan-sh';
// import { BaseAssignOpts } from './var.model';
// import { ParameterDef } from './parameter.model';
// import { RedirectDef } from './file.model';

/** Our notion of position, as opposed to `MvdanSh.Pos`. */
export interface Pos {
  Line: number;
  Col: number;
  Offset: number;
}

/** Our notion of base node, as opposed to `MvdanSh.BaseNode`. */
export interface BaseNode {
  // End: Pos;
  // Pos: Pos;

  /** Single instance for entire parse tree */
  meta: BaseMeta;
  /** Reference to parent node  */
  parent: null | ParsedSh;

  /**
   * Sometimes a node needs a uid:
   * - identify command substitution file `/dev/cs-${pid}-${uid}`
   */
  uid?: string;

  /** Used for test expansion */
  boolean?: boolean;
  /** Used for arithmetic expansion */
  number?: number;
  /** Used for arithmetic/boolean expansion */
  string?: string;
  /** Used to calculate actual exit codes */
  exitCode?: number;
  /** Used by Assign nodes only */
  // declOpts?: Partial<BaseAssignOpts>;
  // /** Used by ParamExp nodes only */
  // paramDef?: ParameterDef<any, any>;
  // /** Used by Redirects only */
  // redirDef?: RedirectDef<any>;
  /** Used by ForClause and WhileClause only */
  lastIterated?: number;
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
  meta: BaseMeta;
}

/**
 * `mvdan-sh` receives a string and outputs a parse tree.
 * We transform it into our own format in `parse.service`.
 * Each node in our parse tree has a `meta` (see `BaseNode`).
 * By default they share the same reference, although that may change.
 *
 * It tracks contextual information:
 * - `sessionKey`: which session we are running the code in,
 *   - links the code to a table.
 *   - has value `${defaultSessionKey}` if code not run.
 * - `fd`: mapping from file descriptor to device ket
 */
export interface BaseMeta {
  sessionKey: string;
  pid: number;
  ppid: number;
  pgid: number;
  fd: Record<number, string>;
}

export const defaultSessionKey = 'code-has-not-run';
export const defaultProcessKey = 'code-has-not-run';
export const defaultStdInOut = 'unassigned-tty';
