/** Worker in parent thread */
export interface OsWorker extends Worker {
  postMessage(message: DataFromParent): void;
  addEventListener(type: 'message', listener: (message: DataFromWorker) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
}

/** A web worker */
export interface OsWorkerContext extends Worker {
  postMessage(message: DataFromWorker): void;
  addEventListener(type: 'message', listener: (message: DataFromParent) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
}

interface TestFromParent extends BaseMessage {
  from: 'parent';
}
interface TestFromWorker extends BaseMessage {
  from: 'worker';
}

type DataFromParent = (
  | TestFromParent
);

type DataFromWorker = (
  | TestFromWorker
);

interface BaseMessage {
  /** Message uid */
  key: string;
  /** xterm.uid */
  context: string;
}
