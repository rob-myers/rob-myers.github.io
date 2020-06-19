import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Message } from '@model/worker.model';
import { Classification } from './highlight.model';
import { JsImportMeta, JsExportMeta } from '@components/dev-env/dev-env.model';

/** A Worker instance in parent thread. */
export interface SyntaxWorker extends Worker {
  postMessage(message: MessageFromParent): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromWorker>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
  removeEventListener(type: 'message', listener: (message: Message<MessageFromWorker>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void;
}

/** A web worker. */
export interface SyntaxWorkerContext extends Worker {
  postMessage(message: MessageFromWorker): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromParent>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
  removeEventListener(type: 'message', listener: (message: Message<MessageFromParent>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void;
}

interface WorkerReady {
  key: 'worker-ready';
}
interface SendTsxHighlights {
  key: 'send-tsx-highlights';
  classifications: Classification[];
  editorKey: string;
}
interface SendImportExportMeta {
  key: 'send-import-export-meta';
  origCode: string;
  imports: JsImportMeta[];
  exports: JsExportMeta[];
}

interface RequestTsxHighlights {
  key: 'request-tsx-highlights';
  code: string;
  editorKey: string;
}
interface RequestStatus {
  key: 'request-status';
}
interface RequestImportExportMeta {
  key: 'request-import-exports';
  code: string;
  filename: string;
}

type MessageFromParent = (
  | RequestStatus
  | RequestTsxHighlights
  | RequestImportExportMeta
);

export type MessageFromWorker = (
  | WorkerReady
  | SendTsxHighlights
  | SendImportExportMeta
);

type RefinedMessage<Key> = Extract<MessageFromWorker, { key: Key }>

export async function awaitWorker<Key extends MessageFromWorker['key']>(
  key: Key,
  worker: SyntaxWorker,
  isMessage: (message: RefinedMessage<Key>) => boolean = () => true,
): Promise<RefinedMessage<Key>> {
  return new Promise(resolve => {
    const listener = (message: Message<MessageFromWorker>) => {
      if (message.data.key === key && isMessage(message.data as RefinedMessage<Key>)) {
        worker.removeEventListener('message', listener);
        resolve(message.data as RefinedMessage<Key>);
      }
    };
    worker.addEventListener('message', listener);
  });
}

export function subscribeToWorker(
  worker: SyntaxWorker,
  handler: (msg: MessageFromWorker) => void, 
) {
  return fromEvent<Message<MessageFromWorker>>(worker, 'message')
    .pipe(
      map(({ data }) => data),
      tap(handler)
    ).subscribe();
}
