import * as shortid from 'shortid';
import { BaseTermDef } from '@model/sh/base-term';
import { CompositeType, Term, ExpandComposite } from '@model/term.model';
import { BaseCompositeTerm } from './base-composite';
import { ObservedType } from '@service/term.service';
import { osGetProcessThunk } from '@store/os/process.os.duck';
import { OsDispatchOverload } from '@model/redux.model';
import { osCloseFdAct, osDupFileDescriptorAct, osOpenFileThunk, osUnlinkFileThunk } from '@store/os/file.os.duck';
import { OpenFileOpts } from '@model/file.model';
import { testNever } from '@model/generic.model';

/**
 * redirect
 */
export class RedirectComposite extends BaseCompositeTerm<CompositeType.redirect> {

  public get children() {
    return ([] as Term[]).concat(
      this.def.location,
      this.def.subKey === '<<' ? [this.def.here] : [],
    );
  }

  constructor(public def: RedirectCompositeDef) {
    super(def);
  }

  public async *semantics(dispatch: OsDispatchOverload, processKey: string): AsyncIterableIterator<ObservedType> {
    const { location } = this.def;
    yield* this.runChild({ child: location, dispatch, processKey });

    /**
     * Handle duplication and moving.
     */
    switch (this.def.subKey) {
      case '<':
      case '>': {
        const fd = this.def.fd == null ? (this.def.subKey === '<' ? 0 : 1) : this.def.fd;
        if (this.def.mod === 'dup') {
          if (location.value === '-') {
            yield* this.ensureFd(fd, dispatch, processKey);
            dispatch(osCloseFdAct({ processKey, fd }));
          } else {
            yield* this.ensureFd(location.value, dispatch, processKey);
            dispatch(osDupFileDescriptorAct({ processKey, srcFd: parseInt(location.value), dstFd: fd }));
          }
          // Propagate any exit code from dispatch.
          yield this.exit(this.exitCode || 0);
        } else if (this.def.mod === 'move') {
          yield* this.ensureFd(location.value, dispatch, processKey);
          dispatch(osDupFileDescriptorAct({ processKey, srcFd: parseInt(location.value), dstFd: fd }));
          dispatch(osCloseFdAct({ processKey, fd: parseInt(location.value) }));
          yield this.exit(this.exitCode || 0);
        }
      }
    }

    const fd = 'fd' in this.def ? this.def.fd : undefined;
    switch (this.def.subKey) {
      case '<': {
        // mod: null, so fd<location.
        dispatch(osOpenFileThunk({ processKey, request: { fd: fd == null ? 0 : fd, mode: 'RDONLY', path: location.value } }));
        break;
      }
      case '>': {// mod: null | 'append', so fd>location or fd>>location.
        const opts: OpenFileOpts = { append: this.def.mod === 'append', truncateReg: this.def.mod !== 'append' };
        dispatch(osOpenFileThunk({ processKey, request: { fd: fd == null ? 1 : fd, mode: 'WRONLY', path: location.value, opts } }));
        break;
      }
      case '&>': {// &>location or &>>location, both at stdout and stderr.
        const opts: OpenFileOpts = { append: this.def.append, truncateReg: true };
        dispatch(osOpenFileThunk({ processKey, request: { fd: 1, mode: 'WRONLY', path: location.value, opts } }));
        dispatch(osOpenFileThunk({ processKey, request: { fd: 2, mode: 'WRONLY', path: location.value, opts } }));
        break;
      }
      case '<<':  // Here-doc.
      case '<<<': // Here-string.
      {
        const buffer = [] as string[];
        if (this.def.subKey === '<<') {// location.value is e.g. 'EOF'.
          yield* this.runChild({ child: this.def.here, dispatch, processKey });
          /**
           * Remove a single final newline if exists,
           * due to our global convention concerning lines.
           */
          buffer.push(...this.def.here.value.replace(/\n$/, '').split('\n'));
        } else {
          yield* this.runChild({ child: location, dispatch, processKey });
          buffer.push(location.value);
        }
        /**
         * Create temp file and unlink.
         * - https://www.oilshell.org/blog/2016/10/18.html
         * - TODO Write in new redirection scope?
         */
        const tempPath = `/tmp/here-doc.${shortid.generate()}.${processKey}`;
        dispatch(osOpenFileThunk({ processKey, request: { fd: 10, mode: 'WRONLY', path: tempPath }}));
        yield this.write(buffer, 10);
        dispatch(osCloseFdAct({ processKey, fd: 10 }));
        dispatch(osOpenFileThunk({ processKey, request: { fd: this.def.fd || 0, mode: 'RDONLY', path: tempPath }}));
        dispatch(osUnlinkFileThunk({ processKey, path: tempPath }));
        break;
      }
      case '<>': {// Open fd for read/write.
        const opts: OpenFileOpts = { truncateReg: true };
        dispatch(osOpenFileThunk({ processKey, request: { fd: fd == null ? 0 : fd, mode: 'RDWR', path: location.value, opts } }));
        break;
      }
      default: throw testNever(this.def);
    }
  }

  /**
   * Fail if file descriptor not well-defined or non-existent.
   */
  public async *ensureFd(
    fdInput: string | number,
    dispatch: OsDispatchOverload,
    processKey: string,
  ): AsyncIterableIterator<ObservedType> {
    const fd = typeof fdInput === 'string' ? parseInt(fdInput) : fdInput;

    if (Number.isNaN(fd) || !Number.isInteger(fd) || (fd < 0)) {
      yield this.exit(1, `${fd}: bad file descriptor`);
    }
    
    const { fdToOpenKey } = dispatch(osGetProcessThunk({ processKey }));
    if (!(fd in fdToOpenKey)) {
      yield this.exit(1, `${fd}: bad file descriptor`);
    }
  }
}

type RedirectCompositeDef = BaseTermDef<CompositeType.redirect> & RedirectDef<ExpandComposite>;

type RedirectDef<WordType> = { location: WordType } & (
  | { subKey: '<'; fd?: number; mod: null | 'dup' | 'move' }
  /**
   * Output modifier:
   * {null} (fd>location): Open {location} at {fd} (default 1) for writing.
   * {append} (fd>>location): Open {location} at {fd} (default 1) for appending at location.
   * {dup}: (fd>&location): Duplicate file descriptor {location} at {fd} (default 1).
   *   {location} must be a valid fd which writes output, or '-' (close fd).
   *   TODO: special case where {location} evaluates to whitespace.
   * {move} (<&-): Move file descriptor {location} to {fd} (default 1).
   *   {location} must be a valid fd which writes output.
   */
  | { subKey: '>'; fd?: number; mod: null | 'append' | 'dup' | 'move' }
  // Open stdout and stderr for writing, possibly appending.
  | { subKey: '&>'; append: boolean }
  // Here-doc at fd (default 0).
  | { subKey: '<<'; fd?: number; here: WordType }
  // Here-string `location` at fd (default 0).
  | { subKey: '<<<'; fd?: number }
  // Open fd (default 0) for reading and writing.
  | { subKey: '<>'; fd?: number });
