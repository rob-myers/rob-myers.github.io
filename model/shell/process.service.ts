import useStore, { State as ShellState, Session, Process } from '@store/shell.store';
import { FileWithMeta, parseSh } from './parse.service';
import { transpileSh } from './transpile.service';
import { addToLookup } from '@store/store.util';
import { mapValues } from '@model/generic.model';
import { cloneVar } from './var.service';

export class ProcessService {
  
  private set!: ShellState['api']['set'];

  /**
   * Create a dummy process so the shell can use its scopes.
   * Its PID is the SID of the current session.
   */
  createLeadingProcess(sessionKey: string) {
    // Ensure shortcut
    this.set = this.set || useStore.getState().api.set;
    
    const { sid: pid, ttyShell } = this.getSession(sessionKey);

    const fdToOpenKey = {
      // TtyShell already reads from here, but so could `read` in another process.
      0: ttyShell.canonicalPath,
      // TtyShell already writes here, as does any descendent process (sans redirect).
      1: ttyShell.canonicalPath,
      2: ttyShell.canonicalPath,
    };

    this.set(({ proc }) => ({
      proc: addToLookup({
        key: `${pid}`,
        sessionKey,
        pid,
        ppid: 0,
        parsed: parseSh.parse(''), // Satisfies typing
        subscription: null, // We'll never actually run it 
        fdToOpenKey,
        nestedRedirs: [{ ...fdToOpenKey }],
        nestedVars: [],
      }, proc),
    }));
  }

  createProcess(
    parsed: FileWithMeta,
    sessionKey: string,
    parentPid: number,
  ) {
    const pid = useStore.getState().nextProcId;
    // Must mutate to affect all descendents
    Object.assign(parsed.meta, { pid, sessionKey });

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
        nestedVars: nestedVars
          .map(fdToOpenKey => mapValues(fdToOpenKey, v => cloneVar(v))),
      }, proc),
      nextProcId: nextProcId + 1,
    }));
    return { pid };
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
  
  private getProcess(pid: number): Process {
    return useStore.getState().proc[pid];
  }

  private getSession(sessionKey: string): Session {
    return useStore.getState().session[sessionKey];
  }

}

export const processService = new ProcessService;
