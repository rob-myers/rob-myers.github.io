import shortid from 'shortid';
import { mapValues, last, removeFirst } from '@model/generic.model';
import useStore, { State as ShellState, Session, Process, ProcessGroup } from '@store/shell.store';
import { addToLookup } from '@store/store.util';
import * as Sh from './parse.service';
import { OpenFileRequest, OpenFileDescription } from './file.model';
import { NamedFunction } from './var.model';
import { semanticsService, ShError } from './semantics.service';
import { fileService } from './file.service';
import { varService } from './var.service';
import { SendXtermError } from './tty.shell';

export class ProcessService {
  
  private set!: ShellState['api']['set'];
  private mockParsed!: Sh.FileWithMeta;

  initialise() {
    this.set = useStore.getState().api.set;
    if (typeof window !== 'undefined') {
      this.mockParsed = Sh.parseService.parse('');
    }
  }

  addCleanups(pid: number, ...cbs: (() => void)[]): () => void {
    this.getProcess(pid).cleanups.push(...cbs);
    return () => cbs.forEach(cb => removeFirst(this.getProcess(pid).cleanups, cb));
  }

  cleanup(pid: number) {
    const { cleanups } = this.getProcess(pid);
    cleanups.reverse().forEach(cleanup => cleanup());
    cleanups.length = 0;
  }

  clearCleanups(pid: number) {
    this.getProcess(pid).cleanups.length = 0;
  }

  /**
   * Create a dummy process so the shell can use its scopes.
   * Its PID is the SID of the current session.
   */
  createLeadingProcess(sessionKey: string) {
    const { sid: pid, ttyShell } = this.getSession(sessionKey);
    /**
     * The canonical paths `/dev/tty-1`s point to the tty's inode.
     * We also use this path to indicate an OpenFileDescription created
     * via api.createSession in shell.store.
     */
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
        ppid: pid, // Leading process is its own parent
        pgid: pid, // Leading process is in its own group
        parsed: this.mockParsed,
        subscription: null, // We'll never actually run it 
        fdToOpen: mapValues(fdToOpenKey, (ofdKey) => ofd[ofdKey]),
        nestedRedirs: [{ ...fdToOpenKey }],
        nestedVars: [{
          USER: { key: 'plain', varName: 'USER', value: 'root', exported: true, readonly: false },
          0: { key: 'positional', varName: '0', index: 0, value: 'behave-yr', exported: true, readonly: false },
        }],
        toFunc: {},
        lastExitCode: null,
        lastBgPid: null,
        cleanups: [],
      }, proc),
    }));

    // Add leading process to its own group
    this.createProcessGroup({ key: `${pid}`, pgid: pid, sessionKey, pids: [pid] });
  }

  /**
   * Decrement open file description,
   * removing when numLinks is not positive.
   */
  private closeFdInternal(fd: number, fdToOpen: Process['fdToOpen']) {
    const open = fdToOpen[fd];
    if (open) {
      if (open.numLinks > 1) {
        open.numLinks--;
      } else {
        delete this.getOfds()[open.key];
      }
    } else {
      throw new ShError(`${fd}: cannot open non-existent file`, 1);
    }
  }

  closeFd(pid: number, fd: number) {
    const process = this.getProcess(pid);
    // 0th is most recent scope i.e. deepest scope
    if (process.nestedRedirs[0][fd]) {
      this.closeFdInternal(fd, process.fdToOpen);
      delete process.nestedRedirs[0][fd];
    }
    delete process.fdToOpen[fd];
  }

  createProcessGroup(group: ProcessGroup) {
    this.getProcessGroups()[group.key] = group;
    return group;
  }

  duplicateFd(pid: number, srcFd: number, dstFd: number) {
    // Close dstFd if opened in current redir scope
    const process = this.getProcess(pid);
    if (process.nestedRedirs[0][dstFd]) {
      this.closeFdInternal(dstFd, process.fdToOpen);
    }
    
    const { [srcFd]: srcFile } = process.fdToOpen;
    process.fdToOpen[dstFd] = srcFile;
    process.nestedRedirs[0][dstFd] = srcFile.key;
    this.getOfds()[srcFile.key].numLinks++;
  }

  ensureFd(pid: number, fdInput: string | number) {
    const fd = typeof fdInput === 'string' ? parseInt(fdInput) : fdInput;
    if (Number.isNaN(fd) || !Number.isInteger(fd) || (fd < 0)) {
      throw new ShError(`${fd}: bad file descriptor`, 1);
    }
    if (!(fd in this.getProcess(pid).fdToOpen)) {
      throw new ShError(`${fd}: bad file descriptor`, 1);
    }
  }

  execProcess(pid: number, node: Sh.Stmt) {
    const process = this.getProcess(pid);
    // Must clone parse tree because meta will differ
    const cloned = Sh.parseService.clone(node);
    // Must mutate to affect all descendents
    Object.assign<Sh.FileMeta, Partial<Sh.FileMeta>>(cloned.meta, { pid: process.pid });
    // Must wrap Stmt in File
    process.parsed = Sh.parseService.wrapInFile(cloned);
  }

  findAncestral(pid: number, predicate: (state: Process) => boolean) {
    const proc = this.getProcesses();
    let process = proc[pid];
    /**
     * Since our shells (leading processes) are their own
     * parent we can terminate on self-parent.
     */
    do {
      if (predicate(process)) {
        return process;
      }
    } while (process !== (process = proc[process.ppid]));
    return null;
  }

  /**
   * Efficiently fork a process. Use cases:
   * - when piping, for each pipe child.
   * - when explicitly using the background.
   * - for command/process substitution.
   */
  private forkProcess(ppid: number) {
    const parent = this.getProcess(ppid);    
    const pid = this.getNextPid();
    
    // We only keep env vars and $0 (direct refs, not cloned)
    // TODO only permit $0 and env vars in earliest scope
    const nextVars = { ...parent.nestedVars.pop()! };
    parent.nestedVars.push(nextVars);
    Object.values(nextVars).forEach(({ exported, varName, key }) =>
      !exported && varName !== '0' && delete nextVars[key]
    );

    this.set(({ proc, procGrp }) => {
      // We mutate proc rather than creating fresh object
      proc[pid] = {
        key: `${pid}`,
        sessionKey: parent.sessionKey,
        pid,
        ppid,
        pgid: parent.pgid,
        // We'll always overwrite `parsed` by execing the process
        parsed: this.mockParsed,
        subscription: null,
        fdToOpen: { ...parent.fdToOpen },
        nestedRedirs: [{ ...mapValues(parent.fdToOpen, (o) => o.key) }],
        nestedVars: [nextVars],
        toFunc: { ...parent.toFunc },
        lastExitCode: null,
        lastBgPid: null,
        cleanups: [],
      };
      // Add to parent process group
      procGrp[parent.pgid].pids.push(pid);

      return { nextProcId: pid + 1 };
    });
    return this.getProcess(pid);
  }

  getEnvKey(pid: number) {
    const { sessionKey } = this.getProcess(pid);
    const { toSessionKey } = useStore.getState();
    return Object.keys(toSessionKey)
      .find(alias => toSessionKey[alias] === sessionKey)!;
  }

  private getOfds() {
    return useStore.getState().ofd;
  }

  getNextPid() {
    return useStore.getState().nextProcId;
  }

  getProcess(pid: number): Process {
    return this.getProcesses()[pid];
  }

  getProcessesInGroup(pgid: number) {
    const group = this.getProcessGroup(pgid);
    return group.pids.map(pid => this.getProcess(pid));
  }

  private getProcessGroup(pgid: number): ProcessGroup {
    return this.getProcessGroups()[pgid];
  }
  
  private getProcessGroups() {
    return useStore.getState().procGrp;
  }
  
  private getProcesses() {
    return useStore.getState().proc;
  }
  
  getSession(sessionKey: string): Session {
    return useStore.getState().session[sessionKey];
  }

  async invokeFunction(pid: number, namedFunc: NamedFunction, args: string[]) {
    varService.pushPositionalsScope(pid, args);
    try {
      if (namedFunc.type === 'shell') {
        const { sessionKey } = this.getProcess(pid);
        await this.runInShell(namedFunc.node, sessionKey);
      } else {
        const result = await namedFunc.func()(varService.createVarProxy(pid));
        if (result !== undefined) {
          this.getProcess(pid).fdToOpen[1].write(result);
        }
      }
    } finally {
      varService.popPositionalsScope(pid);
    }
  }

  isForegroundProcess(pid: number) {
    const { sessionKey } = this.getProcess(pid)
    return this.getSession(sessionKey).fgStack.includes(pid);
  }

  isInteractiveShell({ meta }: Sh.BaseNode) {
    return meta.pid === meta.sid;
  }

  isTty(pid: number, fd: number) {
    return this.getProcess(pid).fdToOpen[0].file.isATty();
  }

  /**
   * Was process launched interactively?
   * We don't support launching shells from shells.
   */
  launchedInteractively(pid: number): boolean {
    const { parsed } = this.getProcess(pid);
    return this.isInteractiveShell(parsed);
  }

  /**
   * Try to open a file in a process.
   */
  openFile(pid: number, { path: absPath, fd }: OpenFileRequest) {
    let file = fileService.getFile(absPath);

    if (!file) {
      if (!fileService.validatePath(absPath)) {
        throw new ShError(`${absPath}: only absolute paths /{dev,root,tmp}/foo are supported`, 1);
      }
      // Create and mount a file
      file = fileService.makeWire(absPath);
      fileService.saveFile(file);
    }

    // Create open file description and connect to process
    // If file descriptor `undefined` we'll use minimal unassigned
    const process = this.getProcess(pid);
    const opened = new OpenFileDescription(shortid.generate(), file);
    this.getOfds()[opened.key] = opened;
    const nextFd = fileService.getNextFd(process.fdToOpen, fd);
    
    if (nextFd in process.fdToOpen) {// Close if open
      this.closeFd(pid, nextFd);
    }
    this.setFd(pid, nextFd, opened);
    return opened;
  }
  
  /**
   * Remove deepest redirection scope in process.
   * We always mutate processes once created.
   */
  popRedirectScope(pid: number) {
    const ofd = this.getOfds();
    const process = this.getProcess(pid);
    const [deepest, ...nextNestedRedirs] = process.nestedRedirs;
    
    // Close anything opened explicitly in deepest scope
    Object.keys(deepest).forEach((fd) =>
      this.closeFdInternal(Number(fd), mapValues(deepest, (key) => ofd[key])),
    );

    process.nestedRedirs = nextNestedRedirs;
    const fdToOpenKey = nextNestedRedirs.slice().reverse().reduce(
      (agg, item) => ({ ...agg, ...item }),
      {} as Record<number, string>,
    );
    process.fdToOpen = mapValues(fdToOpenKey, (ofdKey) => ofd[ofdKey]);
  }

  /**
   * Deepen redirection scope in process.
   */
  pushRedirectScope(pid: number) {
    this.getProcess(pid).nestedRedirs.unshift({});
  }

  readOnceFromTty(sessionKey: string, reader: (msg: any) => void) {
    const { ttyShell } = this.getSession(sessionKey);
    return ttyShell.readOnceFromTty(reader);
  }

  removeProcess(pid: number) {
    const { pgid } = this.getProcess(pid);
    this.removeProcessFromGroup(pid, pgid);
    delete this.getProcesses()[pid];
  }

  removeProcesses(pids: number[]) {
    pids.forEach(pid => this.removeProcess(pid));
  }

  /** We assume `pid` already resides in the group */
  removeProcessFromGroup(pid: number, pgid: number)  {
    const group = this.getProcessGroup(pgid);
    group.pids = group.pids.filter(x => x !== pid);
    if (!group.pids.length) {
      delete this.getProcessGroups()[pgid];
    }
  }

  /**
   * Run parsed code in session's leading process.
   */
  runInShell(parsed: Sh.FileWithMeta, sessionKey: string) {
    const transpiled = semanticsService.transpile(parsed);
    const pid = this.getSession(sessionKey).sid;

    // Must mutate to affect all descendents
    Object.assign<Sh.FileMeta, Sh.FileMeta>(parsed.meta, { pid, sessionKey, sid: pid });

    return new Promise((resolve, reject) => {
      const process = this.getProcess(pid);
      process.parsed = parsed;

      process.subscription = transpiled.subscribe({
        next: (msg) =>
          console.log('received', msg), // TEMP
        complete: () => {
          console.log(`${parsed.meta.sessionKey}: shell completed`)
          process.subscription = null;
          resolve();
        },
        error: (err) => {
          // Ctrl-C corresponds to null error
          console.error(`${parsed.meta.sessionKey}: shell terminated`, err);
          process.subscription = null;
          reject(err);
        },
      });
    });
  }

  setExitCode(pid: number, code: number) {
    this.getProcess(pid).lastExitCode = code;
  }

  setFd(pid: number, fd: number, opened: OpenFileDescription<any>) {
    const process = this.getProcess(pid);
    // Close if opened in current redirection scope
    if (process.nestedRedirs[0][fd]) {
      this.closeFdInternal(pid, process.fdToOpen);
    }
    process.fdToOpen[fd] = opened;
    process.nestedRedirs[0][fd] = opened.key;
    opened.numLinks++;
  }

  /**
   * Add/move process to process group, creating latter if needed.
   */
  private setProcessGroup(pid: number, pgid: number) {
    const { pgid: prevPgid, sessionKey } = this.getProcess(pid);
    if (pgid === prevPgid) {
      return;
    }

    this.removeProcessFromGroup(pid, prevPgid);
    const group = this.tryGetProcessGroup(pgid)
      || this.createProcessGroup({ key: `${pgid}`, sessionKey, pgid, pids: [] });
    group.pids.push(pid);
  }

  /**
   * Set the foreground process group of a session.
   * Used e.g. when launching a pipeline from shell.
   */
  setSessionForeground(sessionKey: string, pgid: number) {
    this.getSession(sessionKey).fgStack.push(pgid);
  }

  /** Cancellable sleep like builtin `sleep` */
  sleep(pid: number, ms: number) {
    return new Promise((resolve, reject) => {
      const removeCleanup = this.addCleanups(pid, () => reject(null));
      setTimeout(() => {
        removeCleanup();
        resolve();
      }, ms)
    });
  }

  /**
   * Spawn a process without starting it.
   */
  spawnProcess(ppid: number, node: Sh.Stmt, background: boolean) {
    const forked = this.forkProcess(ppid);
    this.execProcess(forked.pid, node);

    if (background) {
      // If parent in session foreground, create new process group for child
      const { fgStack } = this.getSession(forked.sessionKey);
      if (fgStack.length && (forked.pgid === last(fgStack))) {
        this.setProcessGroup(forked.pid, forked.pid);
      }
      this.getProcess(ppid).lastBgPid = forked.pid;
    }

    return forked;
  }

  private tryGetProcessGroup(pgid: number) {
    return this.getProcessGroups()[pgid] || null;
  }

  /**
   * Unlink a file.
   */
  unlinkFile(pid: number, absPath: string) {
    const file = fileService.getFile(absPath);
    if (!file) {
      if (absPath.endsWith('/')) {
        throw new ShError(`${absPath}: is a directory`, 1);
      }
      throw new ShError(`${absPath}: no such file or directory`, 1);
    }

    file.iNode.numLinks--;
    fileService.unlinkFile(file.key);
  }

  /**
   * Write error message to process's stderr.
   */
  warn(pid: number, msg: string) {
    const errorMsg: SendXtermError = { key: 'error', msg };
    const { [2]: opened } = this.getProcess(pid).fdToOpen;
    opened.write(errorMsg);
  }
}

export const processService = new ProcessService;
