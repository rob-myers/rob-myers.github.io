import useStore, { State as ShellState, Session, Process } from '@store/shell.store';
import { FileWithMeta, parseSh, FileMeta, ParsedSh } from './parse.service';
import { transpileSh, ShError } from './transpile.service';
import { addToLookup, updateLookup } from '@store/store.util';
import { mapValues } from '@model/generic.model';
import { varService } from './var.service';
import { FromFdToOpenKey } from './process.model';
import { FsFile, OpenFileRequest } from './file.model';
import { fileService } from './file.service';

export class ProcessService {
  
  private set!: ShellState['api']['set'];

  initialise() {
    this.set = useStore.getState().api.set;
  }

  /**
   * Create a dummy process so the shell can use its scopes.
   * Its PID is the SID of the current session.
   */
  createLeadingProcess(sessionKey: string) {
    const { sid: pid, ttyShell } = this.getSession(sessionKey);

    const fdToOpenKey = {
      // TtyShell already reads from here, but so could `read` in another process
      0: ttyShell.canonicalPath,
      // TtyShell already writes here, as does any descendent process (sans redirect)
      1: ttyShell.canonicalPath,
      2: ttyShell.canonicalPath,
    };
    const ofd = this.getOfds();

    // We will only mutate values in `proc` after their creation
    this.set(({ proc }) => ({
      proc: addToLookup({
        key: `${pid}`,
        sessionKey,
        pid,
        ppid: pid, // Assume leading process is its own parent
        parsed: parseSh.parse(''), // Satisfies typing
        subscription: null, // We'll never actually run it 
        fdToOpen: mapValues(fdToOpenKey, (ofdKey) => ofd[ofdKey]),
        nestedRedirs: [{ ...fdToOpenKey }],
        nestedVars: [{
          USER: { key: 'string', varName: 'USER', value: 'root', exported: true, readonly: false, to: null },
          OLDPWD: { key: 'string', varName: 'OLDPWD', value: '/root', exported: true, readonly: false, to: null },
          PWD: { key: 'string', varName: 'PWD', value: '/root', exported: true, readonly: false, to: null },
          PATH: { key: 'string', varName: 'PATH', value: '/bin', exported: true, readonly: false, to: null },
        }],
        toFunc: {},
        lastExitCode: null,
        lastBgPid: null,
      }, proc),
    }));
  }

  createProcess(
    parsed: FileWithMeta,
    sessionKey: string,
    parentPid: number,
  ) {
    const { sid  } = this.getSession(sessionKey);
    const pid = useStore.getState().nextProcId;
    // Must mutate to affect all descendents
    Object.assign<FileMeta, FileMeta>(parsed.meta, { pid, sessionKey, sid });

    const { fdToOpen, nestedVars, toFunc } = this.getProcess(parentPid);

    // We will only mutate values in `proc` after their creation
    this.set(({ proc, nextProcId }) => ({
      proc: addToLookup({
        key: `${pid}`,
        sessionKey,
        pid,
        ppid: parentPid,
        parsed,
        subscription: null,
        fdToOpen: { ...fdToOpen },
        nestedRedirs: [{ ...mapValues(fdToOpen, (o) => o.key) }],
        nestedVars: nestedVars.map(fdToOpenKey =>
          mapValues(fdToOpenKey, v => varService.cloneVar(v))),
        toFunc: mapValues(toFunc,
          (func) => varService.cloneFunc(func)),
        lastExitCode: null,
        lastBgPid: null,
      }, proc),
      nextProcId: nextProcId + 1,
    }));
    return { pid };
  }


  /**
   * TODO decrement open file description,
   * and remove when numLinks is zero.
   */
  closeFdInternal(opts: {
    fromFd: Process['fdToOpen'];
    /** File descriptor. */
    fd: number;
    /** Current open file description state. */
    ofd: ShellState['ofd'];
    /** Warn if open file description non-existent? */
    warnNonExist?: boolean;
  }) {
    /**
     * TODO mutate ofd
     */
  }

  closeFd(pid: number, fd: number) {
    const ofd = this.getOfds();
    const process = this.getProcess(pid);
    const { fdToOpen, nestedRedirs: [redirs] } = process;

    if (redirs[fd]) {
      this.closeFdInternal({ fromFd: fdToOpen, fd, ofd, warnNonExist: true });
    }
  
    // Remove from fd-to-ofd mapping.
    const nextFromFd = { ...fdToOpen };
    delete nextFromFd[fd];
    // Remove from current nested redirection scope, in case was added there.
    const nextRedirs = { ...redirs };
    delete nextRedirs[fd];
    
    process.fdToOpen = nextFromFd;
    process.nestedRedirs = [nextRedirs, ...process.nestedRedirs.slice(1)];
  }

  duplicateFd(pid: number, srcFd: number, dstFd: number) {
    const ofd = this.getOfds();
    const process = this.getProcess(pid);
    const { fdToOpen: { [srcFd]: srcFile }, nestedRedirs: [redirs] } = process;
    
    // Close dstFd if opened in current redir scope
    if (redirs[dstFd]) {
      this.closeFdInternal({ fromFd: process.fdToOpen, fd: dstFd, ofd })
    }
    
    const nextRedirs = { ...redirs, [dstFd]: srcFile.key };
    process.nestedRedirs = [nextRedirs, ...process.nestedRedirs.slice(1)];
    process.fdToOpen[dstFd] = srcFile;
    ofd[srcFile.key].numLinks++;
  }

  ensureFd(pid: number, fdInput: string | number) {
    const fd = typeof fdInput === 'string' ? parseInt(fdInput) : fdInput;

    if (Number.isNaN(fd) || !Number.isInteger(fd) || (fd < 0)) {
      throw new ShError(`${fd}: bad file descriptor`, 1);
    }
    const { fdToOpen } = this.getProcess(pid);
    if (!(fd in fdToOpen)) {
      throw new ShError(`${fd}: bad file descriptor`, 1);
    }
  }

  findAncestral(pid: number, predicate: (state: Process) => boolean) {
    const proc = this.getProcesses();
    let process = proc[pid];
    /**
     * Since our 'shells' (leading processes) are their own
     * parent we can terminate on self-parent.
     */
    do {
      if (predicate(process)) {
        return process;
      }
    } while (process !== (process = proc[process.ppid]));
    return null;
  }

  private getOfds() {
    return useStore.getState().ofd;
  }

  getProcess(pid: number): Process {
    return this.getProcesses()[pid];
  }
  
  private getProcesses() {
    return useStore.getState().proc;
  }

  private getSession(sessionKey: string): Session {
    return useStore.getState().session[sessionKey];
  }

  isInteractiveShell({ meta }: FileWithMeta) {
    return meta.pid === meta.sid;
  }

  /**
   * TODO
   */
  openFile(pid: number, request: OpenFileRequest) {
    const { path, mode, fd: fdOrUndefined } = request;
    const process = this.getProcess(pid);
    const file = fileService.resolvePath(pid, path);
    /**
     * TODO
     * - throw error if parent dir doesn't exist
     * - create file if new
     * - update numLinks
     * - connect to process fds
     */
  }
  
  /**
   * Remove deepest redirection scope in process.
   */
  popRedirectScope(pid: number) {
    const ofd = this.getOfds();
    const process = this.getProcess(pid);
    const [deepest, ...nextNestedRedirs] = process.nestedRedirs;
    
    // Close anything opened explicitly in deepest scope
    Object.keys(deepest).forEach((fd) =>
      this.closeFdInternal({ fd: Number(fd), fromFd: mapValues(deepest, (key) => ofd[key]), ofd })
    );

    // Mutate process
    process.nestedRedirs = nextNestedRedirs;
    const fdToOpenKey = nextNestedRedirs.slice().reverse().reduce(
      (agg, item) => ({ ...agg, ...item }),
      {} as Record<number, string>,
    );
    process.fdToOpen = mapValues(fdToOpenKey, (ofdKey) => ofd[ofdKey]);
  }

  /**
   * Deepen redirection scope in process.
   * Add fresh scope as 1st item.
   * No need to recompute `fdToOpenKey`.
   */
  pushRedirectScope(pid: number) {
    this.getProcess(pid).nestedRedirs.unshift({});
  }

  /**
   * Run parsed code in session's leading process.
   */
  runInShell(parsed: FileWithMeta, sessionKey: string) {
    const transpiled = transpileSh.transpile(parsed);
    const { sid: pid } = this.getSession(sessionKey);

    // Must mutate to affect all descendents
    Object.assign<FileMeta, FileMeta>(parsed.meta, { pid, sessionKey, sid: pid });

    return new Promise((resolve, reject) => {
      const process = this.getProcess(pid);
      process.parsed = parsed;
      process.subscription = transpiled.subscribe({
        next: (msg) => console.log('received', msg), // TEMP
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    });
  }

  async runScript(pid: number, file: FsFile) {
    /**
     * TODO can run regular files
     */
    console.log(`TODO: run script ${file.key}`);
  }

  setExitCode(pid: number, code: number) {
    this.getProcess(pid).lastExitCode = code;
  }

  startProcess(pid: number) {
    const process = this.getProcess(pid)
    const transpiled = transpileSh.transpile(process.parsed);
    
    return new Promise((resolve, reject) => {
      // We can directly mutate state (btw immer wouldn't allow this)
      process.subscription = transpiled.subscribe({
        next: (msg) => console.log('received', msg), // TEMP
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    });
  }

  stopProcess(pid: number) {
    const process = this.getProcess(pid);
    process.subscription?.unsubscribe();
    process.subscription = null;
  }

  /**
   * TODO
   */
  unlinkFile(pid: number, path: string) {
    
  }

  /**
   * Write message to process's stderr.
   */
  warn(pid: number, msg: string) {
    this.write(pid, 2, msg);
  }
  
  /**
   * Write message to process's file descriptor.
   */
  write(pid: number, fd: number, msgs: string | string[]) {
    const { fdToOpen: { [fd]: { file } } } = this.getProcess(pid);
    // TODO types
    file.writable.write({
       key: 'send-lines',
       lines: msgs instanceof Array ? msgs : [msgs],
    });
  }

}

export const processService = new ProcessService;
