import type * as Geom from '@model/geom/rect.model';

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

export interface Message<Data> extends MessageEvent {
  data: Data;
}

export type MessageFromMain = (
  | PingNavWorker
  | CreateEnv
  | RemoveEnv
  | UpdateRoomNav
  | RemoveRoomNav
  | RequestNavPath
);

interface PingNavWorker {
  key: 'ping-navworker';
}
interface CreateEnv {
  key: 'create-env';
  envKey: string;
}
interface RemoveEnv {
  key: 'remove-env';
  envKey: string;
}
export interface UpdateRoomNav {
  key: 'update-room-nav';
  envKey: string;
  /** Room type e.g. 'straight' */
  roomType: string;
  /** Room instance uid */
  roomUid: string;
  navPartitions: Geom.RectJson[][];
}
export interface RemoveRoomNav {
  key: 'remove-room-nav';
  envKey: string;
  /** Room type e.g. 'straight' */
  roomType: string;
  /** Room instance uid */
  roomUid: string;
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