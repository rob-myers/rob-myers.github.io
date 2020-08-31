import useStore, { State as ShellState, Session, Process } from '@store/shell.store';
import { FileWithMeta, parseSh, FileMeta, ParsedSh } from './parse.service';
import { transpileSh } from './transpile.service';
import { addToLookup, updateLookup } from '@store/store.util';
import { mapValues } from '@model/generic.model';
import { varService } from './var.service';

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
      // TtyShell already reads from here, but so could `read` in another process.
      0: ttyShell.canonicalPath,
      // TtyShell already writes here, as does any descendent process (sans redirect)
      1: ttyShell.canonicalPath,
      2: ttyShell.canonicalPath,
    };

    this.set(({ proc }) => ({
      proc: addToLookup({
        key: `${pid}`,
        sessionKey,
        pid,
        ppid: pid, // Assume leading process is its own parent
        parsed: parseSh.parse(''), // Satisfies typing
        subscription: null, // We'll never actually run it 
        fdToOpenKey,
        nestedRedirs: [{ ...fdToOpenKey }],
        nestedVars: [],
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

    const { fdToOpenKey, nestedVars } = this.getProcess(parentPid);

    this.set(({ proc, nextProcId }) => ({
      proc: addToLookup({
        key: `${pid}`,
        sessionKey,
        pid,
        ppid: parentPid,
        parsed,
        subscription: null,
        fdToOpenKey: { ...fdToOpenKey },
        nestedRedirs: [{ ...fdToOpenKey }],
        nestedVars: nestedVars.map(fdToOpenKey =>
          mapValues(fdToOpenKey, v => varService.cloneVar(v))),
        lastExitCode: null,
        lastBgPid: null,
      }, proc),
      nextProcId: nextProcId + 1,
    }));
    return { pid };
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
   * Run parsed code in session's leading process.
   */
  runInShell(parsed: FileWithMeta, sessionKey: string) {
    const transpiled = transpileSh.transpile(parsed);
    const { sid: pid } = this.getSession(sessionKey);

    // Must mutate to affect all descendents
    Object.assign<FileMeta, FileMeta>(parsed.meta, { pid, sessionKey, sid: pid });

    return new Promise((resolve, reject) => {
      this.set(({ proc }) => ({
        proc: updateLookup(`${pid}`, proc, () => ({
          parsed,
          subscription: transpiled.subscribe({
            next: (msg) => console.log('received', msg), // TEMP
            complete: () => resolve(),
            error: (err) => reject(err),
          }),
        })),
      }))
    });
  }

  setExitCode(pid: number, code: number) {
    this.set(({ proc }) => ({
      proc: updateLookup(`${pid}`, proc, () => ({
        lastExitCode: code,
      })),
    }));
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

  warn(pid: number, msg: string) {
    this.write(pid, 2, msg);
  }

  write(pid: number, fd: number, msg: string) {
    const { fdToOpenKey: { [fd]: openKey } } = this.getProcess(pid);
    const { stream } = this.getOfds()[openKey];
    stream.write({ key: 'send-lines', lines: [msg] }); // TODO types
  }

}

export const processService = new ProcessService;
