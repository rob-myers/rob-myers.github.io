import { TermKey, Term } from '@model/term.model';
import { OsDispatchOverload } from '@model/os.redux.model';
import { ObservedType } from 'service/term.service';

/** Used to define {BaseTerm.termId}. */
let nextTermId = 0;

export abstract class BaseTerm<ExactKey extends TermKey> {

  /**
   * Number of pending {break}s.
   * Used to propagate {break}.
   */
  public breakDepth?: number;
  /**
   * Number of pending {continue}s.
   * Used to propagate {continue}.
   */
  public continueDepth?: number;
  /**
   * Immediate subterms.
   */
  public abstract get children(): Term[];
  /**
   * Exit code in [0, 255].
   * null iff (a) initial, or (b) entered but have not exited.
   */
  public exitCode: null | number = null;
  /**
   * Discriminator amongst term classes.
   */
  public readonly key: ExactKey;
  /**
   * Parent term, null iff root.
   */
  public parent: null | Term;
  /**
   * Used to propagate the return code of a function.
   */
  public returnCode: null | number = null;
  /**
   * Unique key distinguishing term from others.
   * Used to distinguish process keys in SimpleComposite.*launchBinary.
   */
  public readonly termId: string;

  constructor(public def: BaseTermDef<ExactKey>) {
    this.key = def.key; 
    this.termId = `${def.key}-${nextTermId++}`;
    this.parent = null;
    this.onEnter(); // Also invoked on enter term.
  }

  /**
   * Inform children of their parent.
   */
  protected adoptChildren() {
    for (const term of this.children) {
      term.parent = this as unknown as Term;
    }
  }

  /**
   * Shortcut when yielding term exit.
   */
  protected exit(code = 0, line?: string): ObservedType {
    return { key: 'exit', term: this as unknown as Term, code, line };
  }

  /**
   * Resets term data.
   */
  public onEnter(): void {
    this.exitCode = null;
    this.breakDepth = 0;
    this.continueDepth = 0;
    this.returnCode = null;
    this.adoptChildren();
  }

  protected read(maxLines: number, fd = 0, buffer?: string[]): ObservedType {
    return {
      key: 'read',
      maxLines,
      fd,
      buffer,
    };
  }

  /**
   * Semantics of this subterm.
   */
  public abstract semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType>;

  /**
   * Shortcut when yielding warnings.
   */
  protected warn(warning: string | Error): ObservedType {
    return {
      key: 'warn',
      term: this as unknown as Term,
      line: typeof warning === 'string'
        ? warning
        : warning.message
    };
  }

  /**
   * Shortcut when yielding writes.
   * Write an empty line via {this.write('')}.
   * Write process buffer via {this.write()}.
   */
  protected write(data?: string | string[], fd = 1): ObservedType {
    return {
      key: 'write',
      fd,
      lines: data
        ? Array.isArray(data)
          ? data
          : [data]
        : data === undefined
          ? undefined
          : [''],
    };
  }

}

export interface BaseTermDef<ExactKey extends TermKey> {
  key: ExactKey;
  sourceMap?: TermSourceMap;
  comments?: TermComment[];
  src?: string;
}

export interface TermComment {
  /** Including first #. */
  text: string;
  /** Starting from #. */
  sourceMap: TermSourceMap;
}

export interface TermSourceMap extends SourceCodeSection {
  /**
   * Additional source-code positions, e.g. location of semicolon.
   * The {key}s needn't be distinct e.g. `$(( (( 1 + 1 )) ))`
   * has multiple left parenthesises.
   */
  extra: TermSourceExtra[];
}

interface TermSourceExtra {
  key: string;
  pos: CodePosition;
  end: null | CodePosition;
}

interface SourceCodeSection {
  from: CodePosition;
  to: CodePosition;
}

export interface CodePosition {
  col: number;
  row: number;
  offset: number;
}
