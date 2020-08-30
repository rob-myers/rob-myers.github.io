import useStore, { State as ShellState, Session, Process } from '@store/shell.store';
import { FileWithMeta, parseSh } from './parse.service';
import { transpileSh } from './transpile.service';
import { updateLookup, addToLookup } from '@store/store.util';

export class ProcessService {
  
  private set!: ShellState['api']['set'];

  constructor() {}

  /**
   * Create 'dummy' process, so shell can use its scopes.
   * Its `pid` is the session's `sid`.
   */
  createLeadingProcess(sessionKey: string) {
    // Ensure shortcut
    this.set = this.set || useStore.getState().api.set;
    
    const { sid: pid } = this.getSession(sessionKey);
    this.set(({ proc }) => ({
      proc: addToLookup({
        key: `${pid}`,
        sessionKey,
        pid,
        ppid: 0,
        parsed: parseSh.parse(''),
        subscription: null, // We'll never run it 
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

    this.set(({ proc, nextProcId }) => ({
      proc: addToLookup({
        key: `${pid}`,
        sessionKey,
        pid,
        ppid: parentPid,
        parsed,
        subscription: null,        
      }, proc),
      nextProcId: nextProcId + 1,
    }));
    return { pid };
  }
  
  startProcess(pid: number) {
    const process = this.getProcess(pid)
    const transpiled = transpileSh.transpile(process.parsed);
    
    return new Promise((resolve, reject) => {
      // Can directly mutate state
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
