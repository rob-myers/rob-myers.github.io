import { OsWorker, Message, MessageFromOsWorker } from '@model/os/os.worker.model';

export abstract class BaseOsBridge<Def extends BaseOsBridgeDef> {
  constructor(protected def: Def) {}
  
  public initialise() {// Listen to worker
    this.def.osWorker.addEventListener('message', this.onWorkerMessage.bind(this));
  }

  public dispose() {
    this.def.osWorker.removeEventListener('message', this.onWorkerMessage);
  }

  protected abstract onWorkerMessage(data: Message<MessageFromOsWorker>): void;
}

export interface BaseOsBridgeDef {
  osWorker: OsWorker;
}
