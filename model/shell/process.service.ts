import shortid from 'shortid';
import { mapValues, last } from '@model/generic.model';
import useStore, { State as ShellState, Session, Process, ProcessGroup } from '@store/shell.store';
import { addToLookup } from '@store/store.util';
import { ShellStream } from './shell.stream';
import { FsFile, OpenFileRequest, OpenFileDescription } from './file.model';
import { SpawnOpts } from './process.model';
import * as Sh from './parse.service';
import { transpileSh, ShError } from './transpile.service';
import { varService } from './var.service';
import { fileService } from './file.service';
import { ansiWarn, ansiReset } from './tty.xterm';
import { builtinService } from './builtin.service';

export class ProcessService {
  
  private set!: ShellState['api']['set'];
  private mockParsed!: Sh.FileWithMeta;

  initialise() {
    this.set = useStore.getState().api.set;
    this.mockParsed = Sh.parseSh.parse('');
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
        ppid: pid, // Leading process is its own parent
        pgid: pid, // Leading process is in its own group
        parsed: this.mockParsed,
        subscription: null, // We'll never actually run it 
        fdToOpen: mapValues(fdToOpenKey, (ofdKey) => ofd[ofdKey]),
        nestedRedirs: [{ ...fdToOpenKey }],
        nestedVars: [{
          USER: { key: 'string', varName: 'USER', value: 'root', exported: true, readonly: false, to: null },
          OLDPWD: { key: 'string', varName: 'OLDPWD', value: '/root', exported: true, readonly: false, to: null },
          PWD: { key: 'string', varName: 'PWD', value: '/root', exported: true, readonly: false, to: null },
          // PATH: { key: 'string', varName: 'PATH', value: '/bin', exported: true, readonly: false, to: null },
        }],
        toFunc: {},
        lastExitCode: null,
        lastBgPid: null,
      }, proc),
    }));

    // Add leading process to its own group
    this.createProcessGroup({ key: `${pid}`, pgid: pid, sessionKey, pids: [pid] });
  }

  /**
   * Decrement open file description,
   * removing when numLinks is not positive.
   */
  private closeFdInternal(
    /** File descriptor. */
    fd: number,
    fromFd: Process['fdToOpen'],
    /** Warn if open file description non-existent? */
    warnNonExist?: boolean,
  ) {
    const open = fromFd[fd];
    if (open) {
      if (open.numLinks > 1) {
        open.numLinks--;
      } else {
        delete this.getOfds()[open.key];
      }
    } else if (warnNonExist) {
      console.error(`Cannot open non-existent file at ${fd}`);
    }
  }

  closeFd(pid: number, fd: number) {
    const { fdToOpen, nestedRedirs } = this.getProcess(pid);

    if (nestedRedirs[0][fd]) {
      this.closeFdInternal(fd, fdToOpen, true);
    }
  
    delete fdToOpen[fd];
    delete nestedRedirs[0][fd];
  }

  createProcessGroup(group: ProcessGroup) {
    this.getProcessGroups()[group.key] = group;
    return group;
  }

  duplicateFd(pid: number, srcFd: number, dstFd: number) {
    const ofd = this.getOfds();
    const process = this.getProcess(pid);
    const { fdToOpen: { [srcFd]: srcFile }, nestedRedirs } = process;
    
    // Close dstFd if opened in current redir scope
    if (nestedRedirs[0][dstFd]) {
      this.closeFdInternal(dstFd, process.fdToOpen);
    }
    
    process.fdToOpen[dstFd] = srcFile;
    nestedRedirs[0][dstFd] = srcFile.key;
    ofd[srcFile.key].numLinks++;
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
    const cloned = Sh.parseSh.clone(node);
    // Must mutate to affect all descendents
    Object.assign<Sh.FileMeta, Partial<Sh.FileMeta>>(cloned.meta, { pid: process.pid });
    process.parsed = Sh.parseSh.wrapInFile(cloned);
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

  private forkProcess(
    ppid: number,
    /** Subshells can share vars and builtins won't use them */
    shareVars = false,
  ) {
    const parent = this.getProcess(ppid);    
    const pid = useStore.getState().nextProcId;
    if (!parent) {
      throw new ShError(`cannot fork non-extant process ${ppid}`, 1, 'PP_NO_EXIST');
    }
    
    let forkedNestedVars = parent.nestedVars;
    if (!shareVars) {
      forkedNestedVars = [{}];
      // Restrict to vars in earliest scope i.e. ignore `local` variables
      Object.values(last(parent.nestedVars)!)
        // Restrict to env vars, excluding positive positionals
        .filter(({ exported, key, varName }) => exported && (key !== 'positional' || varName === '0'))
        .forEach((x) => forkedNestedVars[0][x.key] = varService.cloneVar(x));
    }

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
        nestedVars: forkedNestedVars,
        toFunc: shareVars
          ? parent.toFunc
          : mapValues(parent.toFunc, (func) => varService.cloneFunc(func)),
        lastExitCode: null,
        lastBgPid: null,
      };
      // Add to parent process group
      procGrp[parent.pgid].pids.push(pid);

      return { nextProcId: pid + 1 };
    });
    return this.getProcess(pid);
  }

  private getOfds() {
    return useStore.getState().ofd;
  }

  getProcess(pid: number): Process {
    return this.getProcesses()[pid];
  }

  private getProcessGroup(pgid: number): ProcessGroup | null {
    return this.getProcessGroups()[pgid] || null;
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

  /** Statically detect builtins */
  private isBuiltinStatically(node: Sh.Stmt) {
    return builtinService.isBuiltinCommand(((node.Cmd as Sh.CallExpr)?.Args[0].Parts[0] as Sh.Lit)?.Value || '');
  }

  isInteractiveShell({ meta }: Sh.BaseNode) {
    return meta.pid === meta.sid;
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
  openFile(pid: number, { path, mode, fd }: OpenFileRequest) {
    const absPath = fileService.resolvePath(pid, path);

    if (fileService.hasDir(absPath)) {// Cannot open directory
      throw Error(`${path}: is a directory`);
    } else if (!fileService.hasParentDir(absPath)) {// Parent directory must exist
      throw new ShError(`${path}: no such file or directory`, 1, 'F_NO_EXIST');
    }

    let file = fileService.getFile(absPath);
    if (!file) {
      if (mode === 'RDONLY') {
        throw new ShError(`${path}: no such file or directory`, 1, 'F_NO_EXIST');
      }
      // Create and mount a file (a 'wire')
      const stream = new ShellStream;
      file = fileService.createFsFile(absPath, stream, stream);
      fileService.saveFile(file);
    }

    // Create open file description and connect to process
    const process = this.getProcess(pid);
    const opened = new OpenFileDescription(shortid.generate(), file, mode);
    // If `fd` undefined we'll use minimal unassigned file descriptor
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
   * Add fresh scope as 1st item.
   * No need to recompute `fdToOpen`.
   */
  pushRedirectScope(pid: number) {
    this.getProcess(pid).nestedRedirs.unshift({});
  }

  /** We assume `pid` already resides in the group */
  removeProcessFromGroup(pid: number, pgid: number)  {
    const group = this.getProcessGroup(pgid)!;
    group.pids = group.pids.filter(x => x !== pid);
    if (!group.pids.length) {
      delete this.getProcessGroups()[pgid];
    }
  }

  /**
   * Run parsed code in session's leading process.
   */
  runInShell(parsed: Sh.FileWithMeta, sessionKey: string) {
    const transpiled = transpileSh.transpile(parsed);
    const { sid: pid } = this.getSession(sessionKey);

    // Must mutate to affect all descendents
    Object.assign<Sh.FileMeta, Sh.FileMeta>(parsed.meta, { pid, sessionKey, sid: pid });

    return new Promise((resolve, reject) => {
      const process = this.getProcess(pid);
      process.parsed = parsed;
      process.subscription = transpiled.subscribe({
        next: (msg) => console.log('received', msg), // TEMP
        complete: () => {
          console.log(`${parsed.meta.sessionKey}: shell execution terminated`)
          resolve();
        },
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

  setFd(pid: number, fd: number, opened: OpenFileDescription<any>) {
    const { nestedRedirs, fdToOpen } = this.getProcess(pid);

    // Close if opened in current redirection scope
    if (nestedRedirs[0][fd]) {
      this.closeFdInternal(pid, fdToOpen);
    }

    fdToOpen[fd] = opened;
    nestedRedirs[0][fd] = opened.key;
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
    const group = this.getProcessGroup(pgid)
      || this.createProcessGroup({ key: `${pgid}`, sessionKey, pgid, pids: [] });
    group.pids.push(pid);
  }

  /**
   * Set the foreground process group of a session.
   * Used e.g. when launching a pipeline from shell.
   */
  private setSessionForeground(sessionKey: string, pgid: number) {
    this.getSession(sessionKey).fgStack.push(pgid);
  }

  /**
   * Spawn a process without starting it.
   */
  spawnProcess(ppid: number, node: Sh.Stmt, opts: SpawnOpts) {
    const forked = this.forkProcess(ppid, opts.subshell || this.isBuiltinStatically(node));
    this.execProcess(forked.pid, node);

    for (const request of opts.redirects) {
      this.openFile(forked.pid, request);
    }

    if (opts.pgid) {// Add to specified process group
      this.setProcessGroup(forked.pid, opts.pgid);
      if (!opts.background) {// Not in background means in session foreground
        this.setSessionForeground(forked.sessionKey, opts.pgid);
      }
    } else if (opts.background) {
      // If parent in session foreground, create new process group for child
      const { fgStack } = this.getSession(forked.sessionKey);
      if (fgStack.length && (forked.pgid === last(fgStack))) {
        this.setProcessGroup(forked.pid, forked.pid);
      }
    }

    if (opts.posPositionals) {
      varService.pushPositionalsScope(forked.pid, opts.posPositionals);
    }

    if (opts.exportVars) {
      for (const { varName, varValue } of opts.exportVars) {
        varService.assignVar(forked.pid, { varName, act: { key: 'default', value: varValue }, exported: true });
      }
    }

    if (opts.background) {
      this.getProcess(ppid).lastBgPid = forked.pid;
    }
  }

  startProcess(pid: number) {
    const process = this.getProcess(pid)
    const transpiled = transpileSh.transpile(process.parsed);
    
    return new Promise((resolve, reject) => {
      // We can directly mutate state (btw immer wouldn't allow this)
      process.subscription = transpiled.subscribe({
        next: (msg) => console.log('received', msg), // TEMP
        complete: () => {
          const { sessionKey } = process.parsed.meta;
          console.log(`${sessionKey}: pid ${pid} terminated`);
          resolve();
        },
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
   * Unlink file.
   */
  unlinkFile(pid: number, path: string) {
    const file = fileService.resolveFile(pid, path);

    if (!file) {
      const absPath = fileService.resolvePath(pid, path);
      if (fileService.hasDir(absPath)) {
        throw new ShError(`${path}: is a directory`, 1);
      }
      throw new ShError(`${path}: no such file or directory`, 1, 'F_NO_EXIST');
    }

    file.iNode.numLinks--;
    fileService.unlinkFile(file.key);
  }

  /**
   * Write textual message to process's stderr.
   */
  warn(pid: number, msg: string) {
    this.write(pid, 2, [ansiWarn, msg, ansiReset].join(''));
  }
  
  /**
   * Write textual message to process's file descriptor.
   */
  private write(pid: number, fd: number, msg: string) {
    const { [fd]: opened } = this.getProcess(pid).fdToOpen;
    opened.write(msg);
  }

}

export const processService = new ProcessService;
