import { TtyINode } from '@model/inode';
import { Observable } from 'rxjs';
import produce from 'immer';
import useStore, { State } from '@store/shell.store';
import FileService from './file.service';

export default class ProcessService {
  
  private set!: State['api']['set'];

  constructor(
    private sessionKey: string,
    private tty: TtyINode,
    private file: FileService, 
  ) {}

  createSessionLeader() {
    this.set = useStore.getState().api.set;
    this.createProcess(
      // TODO
      new Observable((observer) => {
        observer.next(1);
        observer.next(2);
        observer.next(3);
        observer.complete();
      }),
    );
  }

  private createProcess(observable: Observable<any>) {
    this.set((state) => {
      const session = state.session[this.sessionKey];
      const pid = session.nextProcId;
      session.process[pid] = {
        key: `${pid}`,
        sub: observable.subscribe({
          next: console.log, // TEMP
        }),
      };
      session.nextProcId++;
    });
  }


}