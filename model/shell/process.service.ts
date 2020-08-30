import { Observable } from 'rxjs';
import useStore, { State as ShellState, Session, Process } from '@store/shell.store';

export class ProcessService {
  
  private set!: ShellState['api']['set'];

  constructor() {}

  createSessionLeader(sessionKey: string) {
    this.set = this.set || useStore.getState().api.set;
    
    // this.createProcess(
    //   defer(async () => {
    //     await this.while(
    //       of(true),
    //       defer(async () => {
    //         const buffer = [] as string[];
    //         return this.read(1, 0, 1, buffer);
    //       }),
    //     );
    //   }),
    // );
  }

  private createProcess(
    observable: Observable<any>,
    sessionKey: string,
    parentPid?: number,
  ) {
    this.set((state) => {
      const pid = state.nextProcId;
      state.proc[pid] = {
        key: `${pid}`,
        sessionKey,
        pid,
        ppid: parentPid || 0,
        observable,
        subscription: observable.subscribe({
          /**
           * TODO
           */
          next: (act) => console.log('next', act),
        }),
      };
      state.nextProcId++;
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
