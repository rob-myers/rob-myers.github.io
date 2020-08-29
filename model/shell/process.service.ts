import { Observable, lastValueFrom, Subject } from 'rxjs';
import useStore, { State as ShellState, Session, Process } from '@store/shell.store';
import { CreateOfdOpts, OpenFileDescription } from './file.model';

export default class ProcessService {
  
  private set!: ShellState['api']['set'];

  constructor(private sessionKey: string) {}

  createSessionLeader() {
    this.set = useStore.getState().api.set;
    
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

  createOfd(key: string, stream: Subject<any>, opts: CreateOfdOpts): OpenFileDescription {
    return {
      key,
      stream, // Direct reference.
      mode: opts.mode,
      numLinks: 0,
    };
  }

  private createProcess(
    observable: Observable<any>,
    parentPid?: number,
  ) {
    this.set((state) => {
      const session = state.session[this.sessionKey];
      const pid = session.nextProcId;
      session.process[pid] = {
        key: `${pid}`,
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
      session.nextProcId++;
    });
  }

  private getProcess(pid: number): Process {
    return this.session.process[pid];
  }

  private get session(): Session {
    return useStore.getState().session[this.sessionKey];
  }

}