import { OsWorker, Message, MessageFromOsWorker } from '@model/os/os.worker.model';

export abstract class BaseOsBridge<Def extends BaseXtermExtensionDef> {
  constructor(protected def: Def) {}
  
  public initialise() {// Listen to worker
    this.def.osWorker.addEventListener('message', this.onWorkerMessage.bind(this));
  }

  public dispose() {
    this.def.osWorker.removeEventListener('message', this.onWorkerMessage);
  }

  protected abstract onWorkerMessage(data: Message<MessageFromOsWorker>): void;
}

export interface BaseXtermExtensionDef {
  osWorker: OsWorker;
}
