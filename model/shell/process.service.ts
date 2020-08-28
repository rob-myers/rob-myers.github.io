import { TtyINode } from '@model/inode';
import { defer, of, Observable, lastValueFrom } from 'rxjs';
import useStore, { State as ShellState, Session, Process } from '@store/shell.store';
import FileService from './file.service';
import { pause } from '@model/generic.model';

export default class ProcessService {
  
  private set!: ShellState['api']['set'];

  constructor(
    private sessionKey: string,
    private file: FileService, 
  ) {}

  createSessionLeader() {
    this.set = useStore.getState().api.set;
    
    this.createProcess(
      /**
       * TODO stop using rxjs.
       * - Instead convert parsed shell directly into javascript.
       * - Start with an ES module representing session leader.
       */
      defer(async () => {
        await this.while(
          of(true),
          defer(async () => {
            const buffer = [] as string[];
            return this.read(1, 0, 1, buffer);
          }),
        );
      }),
    );
  }

  private createProcess(
    observable: Observable<any>,
    parentPid?: number,
  ) {
    const parent = this.session.process[parentPid || -1];
    const fdToOpen = parent
      ? { ...parent.fdToOpen }
      : { 0: 'rd-tty', 1: 'wr-tty', 2: 'wr-tty' };

    this.set((state) => {
      const session = state.session[this.sessionKey];
      const pid = session.nextProcId;
      session.process[pid] = {
        key: `${pid}`,
        pid,
        ppid: parentPid || 0,
        fdToOpen,
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

  private async read(pid: number, fd: number, maxLines: number, buffer: string[]) {
    const ofdKey = this.getProcess(pid).fdToOpen[fd];
    const ofd = this.session.ofd[ofdKey];
    const { eof, wait } = this.file.readOfd(ofd, maxLines, buffer);
    console.log({ eof, wait }); // TEMP

    if (wait) {
      await new Promise<void>((resolve) =>
        ofd.iNode.readResolvers.push(() => {
          resolve();
          return !!this.getProcess(pid);
        }));
    }
    return { eof, buffer };
  }

  private get session(): Session {
    return useStore.getState().session[this.sessionKey];
  }

  /**
   * TEMP approach.
   */
  private async while<T>(
    condition: Observable<boolean>,
    body: Observable<T>,
  ) {
    console.log('started while');
    while (await lastValueFrom(condition)) {
      console.log('condition true');
      await lastValueFrom(body);
      await pause(1000);
    }
    console.log('ended while');
  }

}