/* eslint-disable @typescript-eslint/camelcase */
import { BuiltinSpecialType, BuiltinOtherType } from '../sh/builtin.model';
import { TimeComposite } from '../sh/composite/time.composite';
import { TestOpComposite } from '../sh/composite/test-op.composite';
import { TestComposite } from '../sh/composite/test.composite';
import { SubshellComposite } from '../sh/composite/subshell.composite';
import { SimpleComposite } from '../sh/composite/simple.composite';
import { SeqComposite } from '../sh/composite/seq.composite';
import { RedirectComposite } from '../sh/composite/redirect.composite';
import { PipeComposite } from '../sh/composite/pipe.composite';
import { OrComposite } from '../sh/composite/or.composite';
import { LetComposite } from '../sh/composite/let.composite';
import { BashBinary } from '../sh/binary/bash.binary';
import { CatBinary } from '../sh/binary/cat.binary';
import { ClearBinary } from '../sh/binary/clear.binary';
import { CpBinary } from '../sh/binary/cp.binary';
import { DateBinary } from '../sh/binary/date.binary';
import { GrepBinary } from '../sh/binary/grep.binary';
import { HeadBinary } from '../sh/binary/head.binary';
import { LsBinary } from '../sh/binary/ls.binary';
import { MkdirBinary } from '../sh/binary/mkdir.binary';
import { MvBinary } from '../sh/binary/mv.binary';
import { PsBinary } from '@model/sh/binary/ps.binary';
import { RealpathBinary } from '../sh/binary/realpath.binary';
import { RmBinary } from '../sh/binary/rm.binary';
import { RmdirBinary } from '../sh/binary/rmdir.binary';
import { SayBinary } from '../sh/binary/say.binary';
import { SeqBinary } from '../sh/binary/seq.binary';
import { SleepBinary } from '../sh/binary/sleep.binary';
import { TailBinary } from '../sh/binary/tail.binary';
import { TtyBinary } from '../sh/binary/tty.binary';

import { ArithmExpand } from '../sh/expand/arithmetic.expand';
import { CommandExpand } from '../sh/expand/command.expand';
import { DoubleQuoteExpand } from '../sh/expand/double-quote.expand';
import { ExtGlobExpand } from '../sh/expand/ext-glob.expand';
import { LiteralExpand } from '../sh/expand/literal.expand';
import { ParameterExpand } from '../sh/expand/parameter.expand';
import { PartsExpand } from '../sh/expand/parts.expand';
import { ProcessExpand } from '../sh/expand/process.expand';
import { SingleQuoteExpand } from '../sh/expand/single-quote.expand';
import { CstyleForIterator } from '../sh/iterator/cstyle-for.iterator';
import { DeclareBuiltin } from '../sh/builtin/declare.builtin';
import { TypesetBuiltin } from '../sh/builtin/typeset.builtin';
import { ExportBuiltin } from '../sh/builtin/export.builtin';
import { LocalBuiltin } from '../sh/builtin/local.builtin';
import { ReadonlyBuiltin } from '../sh/builtin/readonly.builtin';
import { ForIterator } from '../sh/iterator/for.iterator';
import { WhileIterator } from '../sh/iterator/while.iterator';
import { AndComposite } from '../sh/composite/and.composite';
import { ArithmOpComposite } from '../sh/composite/arithm-op.composite';
import { ArrayComposite } from '../sh/composite/array.composite';
import { AssignComposite } from '../sh/composite/assign.composite';
import { BlockComposite } from '../sh/composite/block.composite';
import { CompoundComposite } from '../sh/composite/compound.composite';
import { CaseComposite } from '../sh/composite/case.composite';
import { FunctionComposite } from '../sh/composite/function.composite';
import { IfComposite } from '../sh/composite/if.composite';

import { BreakBuiltin } from '../sh/builtin/break.builtin';
import { CdBuiltin } from '../sh/builtin/cd.builtin';
import { ColonBuiltin } from '../sh/builtin/colon.builtin';
import { ContinueBuiltin } from '../sh/builtin/continue.builtin';
import { EchoBuiltin } from '../sh/builtin/echo.builtin';
import { EvalBuiltin } from '../sh/builtin/eval.builtin';
import { ExecBuiltin } from '../sh/builtin/exec.builtin';
import { ExitBuiltin } from '../sh/builtin/exit.builtin';
import { FalseBuiltin } from '../sh/builtin/false.builtin';
import { HistoryBuiltin } from '@model/sh/builtin/history.builtin';
import { LogoutBuiltin } from '../sh/builtin/logout.builtin';
import { PeriodBuiltin } from '../sh/builtin/period.builtin';
import { PrintfBuiltin } from '../sh/builtin/printf.builtin';
import { PwdBuiltin } from '../sh/builtin/pwd.builtin';
import { ReadBuiltin } from '../sh/builtin/read.builtin';
import { SourceBuiltin } from '../sh/builtin/source.builtin';
import { ReturnBuiltin } from '../sh/builtin/return.builtin';
import { SetBuiltin } from '../sh/builtin/set.builtin';
import { ShiftBuiltin } from '../sh/builtin/shift.builtin';
import { TestBuiltin } from '../sh/builtin/test.builtin';
import { TrapBuiltin } from '../sh/builtin/trap.builtin';
import { TrueBuiltin } from '../sh/builtin/true.builtin';
import { TypeBuiltin } from '../sh/builtin/type.builtin';
import { UnsetBuiltin } from '../sh/builtin/unset.builtin';
import { WcBinary } from '../sh/binary/wc.binary';

export type Term = (
  // | LeafTermJSON
  | CompositeTerm
  | IteratorTerm
);

export type TermKey =
// | LeafType
| CompositeType
| IteratorType

export type BinaryComposite = (
  | BashBinary
  | CatBinary
  | ClearBinary
  | CpBinary
  | DateBinary
  | GrepBinary
  | HeadBinary
  | LsBinary
  | MkdirBinary
  | MvBinary
  | PsBinary
  | RealpathBinary
  | RmBinary
  | RmdirBinary
  | SayBinary
  | SeqBinary
  | SleepBinary
  | TailBinary
  | TtyBinary
  | WcBinary
);

export type Builtin = (
  | OtherBuiltin
  | SpecialBuiltin
);

export type CompositeTerm = (
  | AndComposite
  | ArithmOpComposite
  | ArrayComposite
  | AssignComposite
  | BinaryComposite
  | BlockComposite
  | CaseComposite
  | CompoundComposite
  | DeclareBuiltinTerm
  | ExpandComposite
  | FunctionComposite
  | IfComposite
  | LetComposite
  | OrComposite
  | OtherBuiltin// Includes some declare-based.
  | PipeComposite
  | RedirectComposite
  | SeqComposite
  | SimpleComposite
  | SpecialBuiltin// Includes some declare-based.
  | SubshellComposite
  | TestOpComposite
  | TestComposite
  | TimeComposite
);

export enum CompositeType {
  and= 'and',
  arithm_op= 'arithm_op',
  array= 'array',
  assign= 'assign',
  // bash= 'bash',
  binary= 'binary',
  block= 'block',
  builtin= 'builtin',
  case= 'case',
  compound= 'compound',
  declare= 'declare',
  expand= 'expand',
  if= 'if',
  function= 'function',
  let= 'let',
  or= 'or',
  pipe= 'pipe',
  redirect= 'redirect',
  seq= 'seq',
  simple= 'simple',
  subshell= 'subshell',
  test= 'test',
  test_op= 'test_op',
  time= 'time',
  // word= 'word',
}

export type DeclareBuiltinTerm = (
  | DeclareBuiltin
  | TypesetBuiltin
  | ExportBuiltin
  | LocalBuiltin
  | ReadonlyBuiltin
);

export type DeclareBuiltinType = (
  | BuiltinOtherType.declare
  | BuiltinSpecialType.export
  | BuiltinOtherType.local
  | BuiltinSpecialType.readonly
  | BuiltinOtherType.typeset
);

export type ExpandComposite = (
  | ArithmExpand
  | CommandExpand
  | DoubleQuoteExpand
  | ExtGlobExpand
  | LiteralExpand
  | ParameterExpand
  | PartsExpand
  | ProcessExpand
  | SingleQuoteExpand
);

export type IteratorTerm = (
  | CstyleForIterator
  | ForIterator
  | WhileIterator
);

export enum IteratorType {
  cstyle_for= 'cstyle_for',
  for= 'for',
  while= 'while',
}

export type OtherBuiltin = (
  | CdBuiltin
  | DeclareBuiltin
  | EchoBuiltin
  | FalseBuiltin
  | HistoryBuiltin
  // LetBuiltin is LetComposite.
  | LocalBuiltin
  | PrintfBuiltin
  | PwdBuiltin
  | ReadBuiltin
  | SourceBuiltin
  | TestBuiltin
  | TypeBuiltin
  | TypesetBuiltin
  | TrueBuiltin
);

export type SpecialBuiltin = (
  | BreakBuiltin
  | ColonBuiltin
  | ContinueBuiltin
  | EvalBuiltin
  | ExecBuiltin
  | ExitBuiltin
  | ExportBuiltin
  | LogoutBuiltin
  | PeriodBuiltin
  | ReadonlyBuiltin
  | ReturnBuiltin
  | SetBuiltin
  | ShiftBuiltin
  | TrapBuiltin
  | UnsetBuiltin
);
