/** A Worker instance in main thread. */
export interface NavWorker extends Worker {
  postMessage(message: MessageFromMain): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromWorker>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
  removeEventListener(type: 'message', listener: (message: Message<MessageFromWorker>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void;
}

/** A web worker. */
export interface NavWorkerContext extends Worker {
  postMessage(message: MessageFromWorker): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromMain>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
  removeEventListener(type: 'message', listener: (message: Message<MessageFromMain>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void;
}

interface Message<Data> extends MessageEvent {
  data: Data;
}

type MessageFromMain = (
  | PingNavWorker
  | SetupNavigable
  | RequestNavPath
);
interface PingNavWorker {
  key: 'ping-navworker';
}
interface SetupNavigable {
  key: 'setup-navigable';
  // TODO provide nav poly
}
interface RequestNavPath {
  key: 'request-navpath';
}

type MessageFromWorker = (
  | NavWorkerReady
);
interface NavWorkerReady {
  key: 'worker-ready'
}