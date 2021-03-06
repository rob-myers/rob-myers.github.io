import type { parseService } from "@model/shell/parse.service";

/** A Worker instance in main thread. */
export interface ParseWorker extends Worker {
  postMessage(message: MessageFromMain): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromWorker>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
  removeEventListener(type: 'message', listener: (message: Message<MessageFromWorker>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void;
}

/** A web worker. */
export interface ParseWorkerContext extends Worker {
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
  | { key: 'ping-worker' }
  | { key: 'req-parse-buffer'; msgId: string; buffer: string[] }
);

type MessageFromWorker = (
  | { key: 'worker-ready' }
  | {
      key: 'parse-buffer-result';
      msgId: string;
      result: ReturnType<typeof parseService.tryParseBuffer>;
    }
);

export async function awaitWorker<Key extends MessageFromWorker['key']>(
  key: Key,
  worker: ParseWorker,
  isMsg: (message: RefinedMessage<Key>) => boolean,
): Promise<RefinedMessage<Key>> {
  return new Promise(resolve => {
    const listener = (message: Message<MessageFromWorker>) => {
      if (message.data.key === key && isMsg(message.data as RefinedMessage<Key>)) {
        worker.removeEventListener('message', listener);
        resolve(message.data as RefinedMessage<Key>);
      }
    };
    worker.addEventListener('message', listener);
  });
}

type RefinedMessage<Key> = Extract<MessageFromWorker, { key: Key }>
