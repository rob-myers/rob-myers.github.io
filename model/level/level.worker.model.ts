import { BaseMessage, Message } from '@model/worker.model';

/** A Worker instance in parent thread. */
export interface LevelWorker extends Worker {
  postMessage(message: MessageFromLevelParent): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromLevelWorker>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
}

/** A web worker. */
export interface LevelWorkerContext extends Worker {
  postMessage(message: MessageFromLevelWorker): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromLevelParent>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
}

interface PingFromParent extends BaseMessage {
  key: 'ping-level';
}
interface PongFromWorker extends BaseMessage {
  key: 'pong-from-level';
}

export type MessageFromLevelParent = (
  | PingFromParent
);
export type MessageFromLevelWorker = (
  | PongFromWorker
);
