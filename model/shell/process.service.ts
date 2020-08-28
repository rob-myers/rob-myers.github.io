import { TtyINode } from '@model/inode';
import { Observable, defer } from 'rxjs';
import useStore, { State as ShellState, Session, Process } from '@store/shell.store';
import FileService from './file.service';
import { INodeType } from '@model/inode/base-inode';

export default class ProcessService {
  
  private set!: ShellState['api']['set'];

  private get session(): Session {
    return useStore.getState().session[this.sessionKey];
  }
  private getProcess(pid: number): Process {
    return this.session.process[pid];
  }

  constructor(
    private sessionKey: string,
    private tty: TtyINode,
    private file: FileService, 
  ) {}

  createSessionLeader() {
    this.set = useStore.getState().api.set;

    // const parseTty = defer(async () => {
    //   await this.read(1, 0, 1)
    // });

    this.createProcess(
      new Observable((observer) => {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.complete();
      }),
      null,
    );
  }

  private createProcess(
    observable: Observable<any>,
    parentPid: number | null,
  ) {
    const parent = this.session.process[parentPid || -1];
    const fdToOpen = parent
      ? { ...parent.fdToOpen }
      : { 0: 'rd-null', 1: 'wr-null', 2: 'wr-null' };

    this.set((state) => {
      const session = state.session[this.sessionKey];
      const pid = session.nextProcId;
      session.process[pid] = {
        key: `${pid}`,
        pid,
        ppid: parentPid || 0,
        fdToOpen,
        sub: observable.subscribe({
          next: console.log, // TEMP
        }),
      };
      session.nextProcId++;
    });

  }

  private offsetOfd(key: string, delta: number) {
    this.set(({ session }) => {
      session[this.sessionKey].ofd[key].offset += delta;
    });
  }

  private read(pid: number, fd: number, maxLines: number, buffer: string[]) {
    const ofdKey = this.getProcess(pid).fdToOpen[fd];
    const { iNode, offset } = this.session.ofd[ofdKey];
    const prevLength = buffer.length;

    if (!iNode.readBlocked) {
      // `0` iff EOF, otherwise it is the number of lines read
      const readReturn = iNode.read(buffer, maxLines, offset);

      if (buffer.length > prevLength) { // At least one line was read
        // Adjust offset for regular/history inodes
        this.offsetOfd(ofdKey, buffer.length - prevLength);

        if (iNode.type === INodeType.fifo) {
          /**
           * Provide data from pipe as soon as possible,
           * also informing any pending writers.
           */
          iNode.awakenWriters();
          return { eof: false, toPromise: null };
        } else if (iNode.type === INodeType.tty) {
          return { eof: false, toPromise: null };
        }
      }

      if (readReturn) {// Not EOF
        if (readReturn < maxLines) {
          // Haven't read `maxLines`, will block below.
        } else {// Have read desired lines without reaching EOF.
          return { eof: false, toPromise: null };
        }
      } else {// Have read lines and seen EOF.
        // console.log({ buffer: buffer.slice(), prevLength });
        return {
          /**
           * Only report EOF if nothing read (read again for EOF).
           * One can read nothing via e.g. empty pipe, or
           * regular file (or history) with offset beyond EOF.
           */
          eof: buffer.length === prevLength,
          toPromise: null,
        };
      }
    }
    /**
     * Either read was immediately blocked, or we read 
     * something but fewer than `maxLines` without seeing EOF.
     */
    return {
      eof: false,
      toPromise: () => new Promise<void>((resolvePromise, _) =>
        iNode.readResolvers.push(() => {
          resolvePromise(); // This should resume the process `pid`
          // Return true iff process hasn't terminated
          return !!this.getProcess(pid);
        })),
    };

  }


}