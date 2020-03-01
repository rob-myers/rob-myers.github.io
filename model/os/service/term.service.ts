import { ReplaySubject } from 'rxjs';
import { Term, CompositeType, ExpandComposite, IteratorType, Builtin, DeclareBuiltinType, BinaryComposite } from '@model/os/term.model';
import { testNever } from '@model/generic.model';
import { BinaryExecType, BinaryType } from '@model/sh/binary.model';
import { ArithmOpComposite } from '@model/sh/composite/arithm-op.composite';
import { BlockComposite } from '@model/sh/composite/block.composite';
import { CaseComposite } from '@model/sh/composite/case.composite';
import { BashBinary } from '@model/sh/binary/bash.binary';
import { CatBinary } from '@model/sh/binary/cat.binary';
import { ClearBinary } from '@model/sh/binary/clear.binary';
import { CpOrMvBinary } from '@model/sh/binary/cp.binary';
import { DateBinary } from '@model/sh/binary/date.binary';
import { GrepBinary } from '@model/sh/binary/grep.binary';
import { HeadBinary } from '@model/sh/binary/head.binary';
import { LsBinary } from '@model/sh/binary/ls.binary';
import { MkdirBinary } from '@model/sh/binary/mkdir.binary';
import { MvBinary } from '@model/sh/binary/mv.binary';
import { RealpathBinary } from '@model/sh/binary/realpath.binary';
import { RmBinary } from '@model/sh/binary/rm.binary';
import { RmdirBinary } from '@model/sh/binary/rmdir.binary';
import { SayBinary } from '@model/sh/binary/say.binary';
import { SeqBinary } from '@model/sh/binary/seq.binary';
import { SleepBinary } from '@model/sh/binary/sleep.binary';
import { TailBinary } from '@model/sh/binary/tail.binary';
import { TtyBinary } from '@model/sh/binary/tty.binary';
import { AndComposite } from '@model/sh/composite/and.composite';
import { ArrayComposite } from '@model/sh/composite/array.composite';
import { AssignComposite } from '@model/sh/composite/assign.composite';
import { BuiltinOtherType, BuiltinSpecialType, BuiltinType, BuiltinBinary, builtinKeyToCommand } from '@model/sh/builtin.model';
import { CdBuiltin } from '@model/sh/builtin/cd.builtin';
import { DeclareBuiltin } from '@model/sh/builtin/declare.builtin';
import { EchoBuiltin } from '@model/sh/builtin/echo.builtin';
import { FalseBuiltin } from '@model/sh/builtin/false.builtin';
import { PrintfBuiltin } from '@model/sh/builtin/printf.builtin';
import { PwdBuiltin } from '@model/sh/builtin/pwd.builtin';
import { ReadBuiltin } from '@model/sh/builtin/read.builtin';
import { SourceBuiltin } from '@model/sh/builtin/source.builtin';
import { TestBuiltin } from '@model/sh/builtin/test.builtin';
import { TrueBuiltin } from '@model/sh/builtin/true.builtin';
import { TypeBuiltin } from '@model/sh/builtin/type.builtin';
import { BreakBuiltin } from '@model/sh/builtin/break.builtin';
import { ColonBuiltin } from '@model/sh/builtin/colon.builtin';
import { ContinueBuiltin } from '@model/sh/builtin/continue.builtin';
import { EvalBuiltin } from '@model/sh/builtin/eval.builtin';
import { ExecBuiltin } from '@model/sh/builtin/exec.builtin';
import { ExitBuiltin } from '@model/sh/builtin/exit.builtin';
import { PeriodBuiltin } from '@model/sh/builtin/period.builtin';
import { ReturnBuiltin } from '@model/sh/builtin/return.builtin';
import { SetBuiltin } from '@model/sh/builtin/set.builtin';
import { ShiftBuiltin } from '@model/sh/builtin/shift.builtin';
import { TrapBuiltin } from '@model/sh/builtin/trap.builtin';
import { UnsetBuiltin } from '@model/sh/builtin/unset.builtin';
import { CompoundComposite } from '@model/sh/composite/compound.composite';
import { LocalBuiltin } from '@model/sh/builtin/local.builtin';
import { ExportBuiltin } from '@model/sh/builtin/export.builtin';
import { ReadonlyBuiltin } from '@model/sh/builtin/readonly.builtin';
import { TypesetBuiltin } from '@model/sh/builtin/typeset.builtin';
import { ExpandType, ParamType } from '@model/sh/expand.model';
import { ArithmExpand } from '@model/sh/expand/arithmetic.expand';
import { CommandExpand } from '@model/sh/expand/command.expand';
import { DoubleQuoteExpand } from '@model/sh/expand/double-quote.expand';
import { ExtGlobExpand } from '@model/sh/expand/ext-glob.expand';
import { LiteralExpand } from '@model/sh/expand/literal.expand';
import { ParameterExpand } from '@model/sh/expand/parameter.expand';
import { PartsExpand } from '@model/sh/expand/parts.expand';
import { ProcessExpand } from '@model/sh/expand/process.expand';
import { SingleQuoteExpand } from '@model/sh/expand/single-quote.expand';
import { FunctionComposite } from '@model/sh/composite/function.composite';
import { IfComposite } from '@model/sh/composite/if.composite';
import { LetComposite } from '@model/sh/composite/let.composite';
import { OrComposite } from '@model/sh/composite/or.composite';
import { PipeComposite } from '@model/sh/composite/pipe.composite';
import { RedirectComposite } from '@model/sh/composite/redirect.composite';
import { SeqComposite } from '@model/sh/composite/seq.composite';
import { SimpleComposite } from '@model/sh/composite/simple.composite';
import { SubshellComposite } from '@model/sh/composite/subshell.composite';
import { TestComposite } from '@model/sh/composite/test.composite';
import { TestOpComposite } from '@model/sh/composite/test-op.composite';
import { TimeComposite } from '@model/sh/composite/time.composite';
import { CstyleForIterator } from '@model/sh/iterator/cstyle-for.iterator';
import { ForIterator } from '@model/sh/iterator/for.iterator';
import { WhileIterator } from '@model/sh/iterator/while.iterator';
import { OsDispatchOverload } from '@model/os/os.redux.model';
import { iterateTerm } from './term.util';
import { NamedFunction } from '@model/os/process.model';
import { WcBinary } from '@model/sh/binary/wc.binary';
import { GetOpts } from '../os.model';

export type ObservedType = (
  | undefined
  /**
   * Each {BaseTerm.*semantics} must first yield this.
   */
  | { key: 'enter'; term: Term }
  /**
   * Write message to stderr with prefix e.g. '-bash: '
   */
  | { key: 'warn'; term: Term; line: string }
  /**
   * Exit term, storing exit code, optionally writing message to stderr
   * with appropriate prefix.
   */
  | { key: 'exit'; term: Term; code: number; line?: string }
  /**
   * Read from {fd} into process buffer or {buffer}.
   */
  | { key: 'read'; maxLines: number; fd: number; buffer?: string[] }
  /**
   * Write {lines} or process buffer to {fd}.
   */
  | { key: 'write'; lines?: string[]; fd: number }
);

export class TermService {

  public compile({ term, dispatch, processKey }: {
    term: Term;
    dispatch: OsDispatchOverload;
    processKey: string;
  }) {
    const iterator = iterateTerm({ term, dispatch, processKey });
    const subject = this.createIteratorSubject<any, ObservedType>(iterator);
    return subject;
  }

  public cloneFunc(func: NamedFunction): NamedFunction {
    return {
      ...func,
      term: this.cloneTerm(func.term),
    };
  }

  public cloneTerm(term: Term): Term {
    switch (term.key) {
      case CompositeType.and: {
        return new AndComposite({
          ...term.def,
          cs: term.def.cs.map((child) => this.cloneTerm(child)),
        });
      }
      case CompositeType.arithm_op: {
        return new ArithmOpComposite({
          ...term.def,
          cs: term.def.cs.map((child) => this.cloneTerm(child)) as typeof term.def.cs,
        });
      }
      case CompositeType.array: {
        return new ArrayComposite({
          ...term.def,
          pairs: term.def.pairs.map(({ key, value }) => ({
            key: key ? this.cloneTerm(key) as ArithmOpComposite | ExpandComposite : null,
            value: this.cloneTerm(value) as ExpandComposite,
          })),
        });
      }
      case CompositeType.assign: {
        const { def } = term;
        switch (def.subKey) {
          case 'array': {
            return new AssignComposite({
              ...def,
              array: this.cloneTerm(def.array) as ArrayComposite,
            });
          }
          case 'item': {
            return new AssignComposite({
              ...def,
              index: this.cloneTerm(def.index) as ArithmOpComposite | ExpandComposite
            });
          }
          case 'var': {
            return new AssignComposite({
              ...def,
              value: def.value
                ? this.cloneTerm(def.value) as ExpandComposite
                : null,
            });
          }
          default: throw testNever(def);
        }
      }
      case CompositeType.binary: {
        switch (term.binaryKey) {
          case BinaryExecType.bash: return new BashBinary(term.def);
          case BinaryExecType.cat: return new CatBinary(term.def);
          case BinaryExecType.clear: return new ClearBinary(term.def);
          case BinaryExecType.cp: return new CpOrMvBinary(term.def);
          case BinaryExecType.date: return new DateBinary(term.def);
          case BinaryExecType.grep: return new GrepBinary(term.def);
          case BinaryExecType.head: return new HeadBinary(term.def);
          case BinaryExecType.ls: return new LsBinary(term.def);
          case BinaryExecType.mkdir: return new MkdirBinary(term.def);
          case BinaryExecType.mv: return new MvBinary(term.def);
          case BinaryExecType.realpath: return new RealpathBinary(term.def);
          case BinaryExecType.rm: return new RmBinary(term.def);
          case BinaryExecType.rmdir: return new RmdirBinary(term.def);
          case BinaryExecType.say: return new SayBinary(term.def);
          case BinaryExecType.seq: return new SeqBinary(term.def);
          case BinaryExecType.sleep: return new SleepBinary(term.def);
          case BinaryExecType.tail: return new TailBinary(term.def);
          case BinaryExecType.tty: return new TtyBinary(term.def);
          case BinaryExecType.wc: return new WcBinary(term.def);
          default: throw testNever(term);
        }
      }
      case CompositeType.block: {
        return new BlockComposite({
          ...term.def,
          cs: term.def.cs.map((child) => this.cloneTerm(child)),
        });
      }
      case CompositeType.builtin: {
        switch (term.builtinKey) {
          case BuiltinOtherType.cd: return new CdBuiltin(term.def);
          case BuiltinOtherType.echo: return new EchoBuiltin(term.def);
          case BuiltinOtherType.false: return new FalseBuiltin(term.def);
          case BuiltinOtherType.printf: return new PrintfBuiltin(term.def);
          case BuiltinOtherType.pwd: return new PwdBuiltin(term.def);
          case BuiltinOtherType.read: return new ReadBuiltin(term.def);
          case BuiltinOtherType.source: return new SourceBuiltin(term.def);
          case BuiltinOtherType.squareBracket: return new TestBuiltin(term.def);
          case BuiltinOtherType.test: return new TestBuiltin(term.def);
          case BuiltinOtherType.true: return new TrueBuiltin(term.def);
          case BuiltinOtherType.type: return new TypeBuiltin(term.def);
          case BuiltinSpecialType.break: return new BreakBuiltin(term.def);
          case BuiltinSpecialType.colon: return new ColonBuiltin(term.def);
          case BuiltinSpecialType.continue: return new ContinueBuiltin(term.def);
          case BuiltinSpecialType.eval: return new EvalBuiltin(term.def);
          case BuiltinSpecialType.exec: return new ExecBuiltin(term.def);
          case BuiltinSpecialType.exit: return new ExitBuiltin(term.def);
          case BuiltinSpecialType.period: return new PeriodBuiltin(term.def);
          case BuiltinSpecialType.return: return new ReturnBuiltin(term.def);
          case BuiltinSpecialType.set: return new SetBuiltin(term.def);
          case BuiltinSpecialType.shift: return new ShiftBuiltin(term.def);
          case BuiltinSpecialType.trap: return new TrapBuiltin(term.def);
          case BuiltinSpecialType.unset: return new UnsetBuiltin(term.def);
          default: throw testNever(term);
        }
      }
      case CompositeType.case: {
        return new CaseComposite({
          ...term.def,
          cases: term.def.cases.map(({ child, globs, terminal }) => ({
            child: this.cloneTerm(child),
            globs: globs.map((glob) => this.cloneTerm(glob) as ExpandComposite),
            terminal,
          })),
        });
      }
      case CompositeType.compound: {
        return new CompoundComposite({
          ...term.def,
          child: this.cloneTerm(term.def.child),
        });
      }
      case CompositeType.declare: {
        switch (term.builtinKey) {
          case BuiltinOtherType.declare: return new DeclareBuiltin(term.def);
          case BuiltinOtherType.local: return new LocalBuiltin(term.def);
          case BuiltinOtherType.typeset: return new TypesetBuiltin(term.def);
          case BuiltinSpecialType.export: return new ExportBuiltin(term.def);
          case BuiltinSpecialType.readonly: return new ReadonlyBuiltin(term.def);
          default: throw testNever(term);
        }
      }
      case CompositeType.expand: {
        switch (term.expandKey) {
          case ExpandType.arithmetic: {
            return new ArithmExpand({
              ...term.def,
              expr: this.cloneTerm(term.def.expr) as ArithmOpComposite | ExpandComposite,
            });
          }
          case ExpandType.command: {
            return new CommandExpand({
              ...term.def,
              cs: term.def.cs.map((child) => this.cloneTerm(child)),
            });
          }
          case ExpandType.doubleQuote: {
            return new DoubleQuoteExpand({
              ...term.def,
              cs: term.def.cs.map((child) => this.cloneTerm(child) as ExpandComposite),
            });
          }
          case ExpandType.extendedGlob: return new ExtGlobExpand(term.def);
          case ExpandType.literal: return new LiteralExpand(term.def);
          case ExpandType.parameter: {
            const { def } = term;
            switch (def.parKey) {
              case ParamType.case: {
                return new ParameterExpand({
                  ...def,
                  pattern: def.pattern ? this.cloneTerm(def.pattern) as ExpandComposite : null,
                });
              }
              case ParamType.default: {
                return new ParameterExpand({
                  ...def,
                  alt: def.alt ? this.cloneTerm(def.alt) as ExpandComposite : null,
                });
              }
              case ParamType.keys:
              case ParamType.length:
              case ParamType.plain:
              case ParamType.pointer:
              case ParamType.position:
              case ParamType.special:
              case ParamType.vars: {
                return new ParameterExpand(def);
              }
              case ParamType.replace: {
                return new ParameterExpand({
                  ...def,
                  orig: this.cloneTerm(def.orig) as ExpandComposite,
                  with: def.with ? this.cloneTerm(def.with) as ExpandComposite : null,
                });
              }
              case ParamType.remove: {
                return new ParameterExpand({
                  ...def,
                  pattern: def.pattern ? this.cloneTerm(def.pattern) as ExpandComposite : null,
                });
              }
              case ParamType.substring: {
                return new ParameterExpand({
                  ...def,
                  from: this.cloneTerm(def.from) as ArithmOpComposite | ExpandComposite,
                  length: def.length ? this.cloneTerm(def.length) as ArithmOpComposite | ExpandComposite : null,
                });
              }
              default: throw testNever(def);
            }
            // return new LiteralExpand(term.def);
          }
          case ExpandType.parts: {
            return new PartsExpand({
              ...term.def,
              cs: term.def.cs.map((child) => this.cloneTerm(child) as ExpandComposite),
            });
          }
          case ExpandType.process: {
            return new ProcessExpand({
              ...term.def,
              cs: term.def.cs.map((child) => this.cloneTerm(child) as ExpandComposite),
            });
          }
          case ExpandType.singleQuote: return new SingleQuoteExpand(term.def);
          default: throw testNever(term);
        }
      }
      case CompositeType.function: {
        return new FunctionComposite(term.def);
      }
      case CompositeType.if: {
        return new IfComposite({
          ...term.def,
          cs: term.def.cs.map(({ child, test }) => ({
            child: this.cloneTerm(child),
            test: test ? this.cloneTerm(test) : null,
          })),
        });
      }
      case CompositeType.let: {
        return new LetComposite({
          ...term.def,
          cs: term.def.cs.map((child) => this.cloneTerm(child) as ArithmOpComposite),
        });
      }
      case CompositeType.or: {
        return new OrComposite({
          ...term.def,
          cs: term.def.cs.map((child) => this.cloneTerm(child)),
        });
      }
      case CompositeType.pipe: {
        return new PipeComposite({
          ...term.def,
          cs: term.def.cs.map((child) => this.cloneTerm(child)),
        });
      }
      case CompositeType.redirect: {
        const { def } = term;
        if (def.subKey === '<<') {
          return new RedirectComposite({
            ...def,
            location: this.cloneTerm(def.location) as ExpandComposite,
            here: this.cloneTerm(def.here) as ExpandComposite,
          });
        } else {
          return new RedirectComposite({
            ...def,
            location: this.cloneTerm(def.location) as ExpandComposite,
          });
        }
      }
      case CompositeType.seq: {
        return new SeqComposite({
          ...term.def,
          cs: term.def.cs.map((child) => this.cloneTerm(child)),
        });
      }
      case CompositeType.simple: {
        const { def } = term;
        return new SimpleComposite({
          ...def,
          assigns: def.assigns.map((x) => this.cloneTerm(x) as AssignComposite),
          redirects: def.redirects.map((x) => this.cloneTerm(x) as RedirectComposite),
          words: def.words.map((x) => this.cloneTerm(x) as ExpandComposite),
        });
      }
      case CompositeType.subshell: {
        return new SubshellComposite({
          ...term.def,
          cs: term.def.cs.map((child) => this.cloneTerm(child)),
        });
      }
      case CompositeType.test: {
        return new TestComposite({
          ...term.def,
          expr: this.cloneTerm(term.def.expr) as TestOpComposite | ExpandComposite,
        });
      }
      case CompositeType.test_op: {
        return new TestOpComposite({
          ...term.def,
          cs: term.def.cs.map(
            (child) => this.cloneTerm(child) as TestOpComposite | ExpandComposite
          ) as typeof term.def.cs,
        });
      }
      case CompositeType.time: {
        return new TimeComposite({
          ...term.def,
          timed: term.def.timed ? this.cloneTerm(term.def.timed) : null,
        });
      }
      case IteratorType.cstyle_for: {
        return new CstyleForIterator({
          ...term.def,
          prior: this.cloneTerm(term.def.prior) as ArithmOpComposite,
          condition: this.cloneTerm(term.def.condition) as ArithmOpComposite,
          post: this.cloneTerm(term.def.post) as ArithmOpComposite,

        });
      }
      case IteratorType.for: {
        return new ForIterator({
          ...term.def,
          items: term.def.items.map((child) => this.cloneTerm(child) as ExpandComposite),
        });
      }
      case IteratorType.while: {
        return new WhileIterator({
          ...term.def,
          guard: this.cloneTerm(term.def.guard),
          body: this.cloneTerm(term.def.body),
        });
      }
      default: throw testNever(term);
    }
  }

  public createBinary({ binaryKey, args }: {
    binaryKey: BinaryType;
    args: string[];
  }): BinaryComposite | BuiltinBinary {
    switch (binaryKey) {
      case '[': return new TestBuiltin({ key: CompositeType.builtin, builtinKey: BuiltinOtherType.squareBracket, args });
      case BinaryExecType.bash: return new BashBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.cat: return new CatBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.clear: return new ClearBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.cp: return new CpOrMvBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.date: return new DateBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.grep: return new GrepBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.head: return new HeadBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.ls: return new LsBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.mkdir: return new MkdirBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.mv: return new MvBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.realpath: return new RealpathBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.rm: return new RmBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.rmdir: return new RmdirBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.sleep: return new SleepBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.say: return new SayBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.seq: return new SeqBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.tail: return new TailBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.tty: return new TtyBinary({ key: CompositeType.binary, binaryKey, args });
      case BinaryExecType.wc: return new WcBinary({ key: CompositeType.binary, binaryKey, args });
      case BuiltinOtherType.echo: return new EchoBuiltin({ key: CompositeType.builtin, builtinKey: binaryKey, args });
      case BuiltinOtherType.pwd: return new PwdBuiltin({ key: CompositeType.builtin, builtinKey: binaryKey, args });
      default: throw testNever(binaryKey);
    }
  }

  public createBuiltin({ builtinKey, args }: {
    builtinKey: Exclude<BuiltinType, DeclareBuiltinType>;
    args: string[];
  }): Builtin {
    switch (builtinKey) {
      case BuiltinOtherType.alias: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.bind: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.builtin: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.caller: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.cd: return new CdBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.command: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.echo: return new EchoBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.enable: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.false: return new FalseBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.help: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.let: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.logout: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.mapfile: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.printf: return new PrintfBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.pwd: return new PwdBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.read: return new ReadBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.readarray: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.source: return new SourceBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.squareBracket: return new TestBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.test: return new TestBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.times: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.true: return new TrueBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.type: return new TypeBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinOtherType.ulimit: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.umask: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinOtherType.unalias: throw Error(`builtinKey '${builtinKey}' not implemented`);
      case BuiltinSpecialType.break: return new BreakBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.colon: return new ColonBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.continue: return new ContinueBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.eval: return new EvalBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.exec: return new ExecBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.exit: return new ExitBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.period: return new PeriodBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.return: return new ReturnBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.set: return new SetBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.shift: return new ShiftBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.trap: return new TrapBuiltin({ key: CompositeType.builtin, builtinKey, args });
      case BuiltinSpecialType.unset: return new UnsetBuiltin({ key: CompositeType.builtin, builtinKey, args });
      default: throw testNever(builtinKey);
    }
  }

  /**
   * Source: https://itnext.io/lossless-backpressure-in-rxjs-b6de30a1b6d4
   */
  private createIteratorSubject<V, T>(iterator: AsyncIterator<T>) {
    /**
     * Slower via async scheduler?
     * Args (undefined, undefined, asyncScheduler)
     */
    const iterator$ = new ReplaySubject() as (
      ReplaySubject<T> & { push: (value?: V) => Promise<void> }
    );
  
    const pushNextValue = ({ done, value }: IteratorResult<T>) => {
      if (done && value === undefined) {
        iterator$.complete();
      } else {
        iterator$.next(value);
      }
    };
  
    iterator$.push = async (value) => pushNextValue(await iterator.next(value as any));
    iterator$.push();
  
    return iterator$;
  }

  public walkTerm(node: Term, func: (node: Term) => void): void {
    func(node);
    switch (node.key) {
      case CompositeType.binary:
      case CompositeType.builtin:
      case CompositeType.redirect:
      case CompositeType.simple: // Ignore mounted.
        return;
      case CompositeType.and:
      case CompositeType.arithm_op:
      case CompositeType.block:
      case CompositeType.or:
      case CompositeType.pipe:
      case CompositeType.seq: {
        node.def.cs.forEach((c) => this.walkTerm(c, func));
        return;
      }
      case CompositeType.array: {
        node.def.pairs.forEach(({ key, value }) => {
          key && this.walkTerm(key, func);
          this.walkTerm(value, func);
        });
        return;
      }
      case CompositeType.assign: {
        switch (node.def.subKey) {
          case 'array': this.walkTerm(node.def.array, func); break;
          case 'item': {
            this.walkTerm(node.def.index, func);
            node.def.value && this.walkTerm(node.def.value, func);
            break;
          }
          case 'var': {
            node.def.value && this.walkTerm(node.def.value, func);
            break;
          }
          default: throw testNever(node.def);
        }
        return;
      }
      case CompositeType.case: {
        this.walkTerm(node.def.head, func);
        node.def.cases.forEach(({ child, globs }) => {
          this.walkTerm(child, func);
          globs.forEach((glob) => this.walkTerm(glob, func));
        });
        return;
      }
      case CompositeType.compound: {
        this.walkTerm(node.def.child, func);
        node.def.redirects.forEach((redirect) => this.walkTerm(redirect, func));
        return;
      }
      case CompositeType.declare: {
        node.def.assigns.forEach((assign) => this.walkTerm(assign, func));
        node.def.options.forEach((option) => this.walkTerm(option, func));
        return;
      }
      case CompositeType.expand: {
        switch (node.expandKey) {
          case ExpandType.arithmetic: {
            this.walkTerm(node.def.expr, func);
            return;
          }
          case ExpandType.command: {
            node.def.cs.forEach((c) => this.walkTerm(c, func));
            return;
          }
          case ExpandType.doubleQuote: {
            node.def.cs.forEach((c) => this.walkTerm(c, func));
            return;
          }
          case ExpandType.extendedGlob:
          case ExpandType.literal:
          case ExpandType.singleQuote: {
            return;
          }
          case ExpandType.parameter: {
            const { def } = node;
            switch (def.parKey) {
              case ParamType['case']:
              case ParamType['remove']: {
                def.index && this.walkTerm(def.index, func);
                def.pattern && this.walkTerm(def.pattern, func);
                break;
              }
              case ParamType['default']: {
                def.alt && this.walkTerm(def.alt, func);
                def.index && this.walkTerm(def.index, func);
                break;
              }
              case ParamType['keys']:
              case ParamType['length']:
              case ParamType['plain']:
              case ParamType['pointer']:
              case ParamType['position']: {
                def.index && this.walkTerm(def.index, func);
                break;
              }
              case ParamType['replace']: {
                def.index && this.walkTerm(def.index, func);
                this.walkTerm(def.orig, func);
                def.with && this.walkTerm(def.with, func);
                break;
              }
              case ParamType['special']: break;
              case ParamType['substring']: {
                this.walkTerm(def.from, func);
                def.index && this.walkTerm(def.index, func);
                def.length && this.walkTerm(def.length, func);
                break;
              }
              case ParamType['vars']: {
                def.index && this.walkTerm(def.index, func);
                break;
              }
              default: throw testNever(def);
            }
            return;
          }
          case ExpandType.parts: {
            node.def.cs.forEach((c) => this.walkTerm(c, func));
            return;          
          }
          case ExpandType.process: {
            node.def.cs.forEach((c) => this.walkTerm(c, func));
            return;          
          }
          default: throw testNever(node);
        }
      }
      case CompositeType.function: {
        this.walkTerm(node.def.body, func);
        return;
      }
      case CompositeType.if: {
        node.def.cs.forEach(({ child, test }) => {
          this.walkTerm(child, func);
          test && this.walkTerm(test, func);
        });
        return;
      }
      case CompositeType.let: {
        node.def.cs.forEach((c) => this.walkTerm(c, func));
        return;
      }
      case CompositeType.subshell: {
        node.def.cs.forEach((c) => this.walkTerm(c, func));
        return;
      }
      case CompositeType.test: {
        this.walkTerm(node.def.expr, func);
        return;
      }
      case CompositeType.test_op: {
        node.def.cs.forEach((c) => this.walkTerm(c, func));
        return;
      }
      case CompositeType.time: {
        node.def.timed && this.walkTerm(node.def.timed, func);
        return;
      }
      case IteratorType.cstyle_for: {
        this.walkTerm(node.def.body, func);
        this.walkTerm(node.def.condition, func);
        this.walkTerm(node.def.post, func);
        this.walkTerm(node.def.prior, func);
        return;
      }
      case IteratorType.for: {
        this.walkTerm(node.def.body, func);
        node.def.items.forEach((c) => this.walkTerm(c, func));
        return;
      }
      case IteratorType.while: {
        this.walkTerm(node.def.body, func);
        this.walkTerm(node.def.guard, func);
        return;
      }
      default: throw testNever(node);
    } 
  }

  private computeOptsSrc(opts: GetOpts<string, string>): string {
    const { _, ...rest } = opts;
    return Object.entries(rest).reduce((agg, [key, value]) =>
      typeof value === 'boolean'
        ? agg + (value ? ` -${key}` : '')
        : `${agg} -${key} '${value}'`
    , '');
    
  }

  /**
   * Compute source code on one line.
   */
  public computeSrc(term: Term): string {
    switch (term.key) {
      case CompositeType.and:
        return term.def.cs.map(c => this.computeSrc(c)).join(' && ');
      case CompositeType.arithm_op: {
        const { symbol, postfix, cs } = term.def;
        return cs.length === 1
          ? postfix
            ? `${this.computeSrc(cs[0])}${symbol}`
            : `${symbol}${this.computeSrc(cs[0])}`
          : cs.map(c => this.computeSrc(c)).join(` ${symbol} `);
      }
      case CompositeType.array: {
        const contents = term.def.pairs.map(({ key, value }) => key
          ? `[${this.computeSrc(key)}]=${this.computeSrc(value)}`
          : this.computeSrc(value));
        return `(${contents})`;
      }
      case CompositeType.assign: {
        const { def, def: { varName } } = term;
        switch (def.subKey) {
          case 'array':
            return `${varName}=${this.computeSrc(def.array)}`;
          case 'item':
            return `${varName}[${
              this.computeSrc(def.index)
            }]=${def.value ? this.computeSrc(def.value) : ''}`;
          case 'var':
            return `${varName}=${def.value ? this.computeSrc(def.value) : ''}`;
          default: throw testNever(def);
        }
      }
      case CompositeType.binary:
        return [
          term.binaryKey,
          this.computeOptsSrc(term.opts),
          term.operands.join(' '),
        ].filter(Boolean).join(' ');
      case CompositeType.block:
        return `{ ${term.def.cs.map(c => this.computeSrc(c)).join('; ')}; }`;
      case CompositeType.builtin:
        return [
          builtinKeyToCommand(term.builtinKey),
          this.computeOptsSrc(term.opts),
          term.operands.join(' '),
        ].filter(Boolean).join(' ');  
      case CompositeType.case:
        return [
          'case',
          this.computeSrc(term.def.head),
          'in',
          term.def.cases.map(({ child, globs, terminal }) => [
            `${globs.map(g => this.computeSrc(g)).join('|')})`,
            this.computeSrc(child),
            terminal,
          ].join(' ')),
        ].filter(Boolean).join(' ');
      case CompositeType.compound: {
        return [
          term.def.negated && '!',
          this.computeSrc(term.def.child),
          term.def.redirects.map(r => this.computeSrc(r)).join(' '),
          term.def.background && '&'
        ].filter(Boolean).join(' ');
      }
      /**
       * TODO clarify
       */
      case CompositeType.declare: {
        return [
          builtinKeyToCommand(term.builtinKey),
          term.def.options.map(c => this.computeSrc(c)).join(' '),
          term.def.assigns.map(c => this.computeSrc(c)).join(' '),
          term.def.others.map(c => this.computeSrc(c)).join(' '),
        ].filter(Boolean).join(' ');
      }
      case CompositeType.expand: {
        // TODO
      }
      // default: throw testNever(term);
    }
    return ''; // TODO
  }
}
