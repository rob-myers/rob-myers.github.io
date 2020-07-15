import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Message } from '@model/worker.model';
import { JsImportMeta, JsExportMeta } from '@model/code/patch-js-imports';
import { SourcePathInterval, SourcePathError } from '@model/code/dev-env.model';
import { Classification } from './highlight.model';
import { ToggleTsxCommentResult } from './analyze-ts.model';

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
  allFilenames: { [filename: string]: true };
}
interface RequestScssPrefixing {
  key: 'request-scss-prefixing';
  scss: string;
  /** `file.scss` induces prefix `file__` */
  filename: string;
}
interface RequestToggledTsxComment {
  key: 'request-toggled-tsx-comment';
  code: string;
  startLineStartPos: number;
  endLineEndPos: number;
}
interface RequestReactRefreshTransform {
  key: 'request-react-refresh-transform';
  code: string;
  filename: string;
}

interface SendTsxHighlights {
  key: 'send-tsx-highlights';
  classifications: Classification[];
  editorKey: string;
}
interface SendImportExportMeta {
  key: 'send-import-exports';
  origCode: string;
  imports: JsImportMeta[];
  exports: JsExportMeta[];
  /** Only for ts/tsx */
  srcErrors?: SourcePathError[]; 
}
interface SendPrefixedScss {
  key: 'send-prefixed-scss';
  origScss: string;
  prefixedScss: null | string;
  pathIntervals: SourcePathInterval[];
  error: null | string;
}
interface SendTsxCommented {
  key: 'send-tsx-commented';
  origCode: string;
  result: ToggleTsxCommentResult; 
}
interface SendReactRefreshTransform {
  key: 'send-react-refresh-transform';
  origCode: string;
  transformedCode: string;
}

type MessageFromParent = (
  | RequestStatus
  | RequestTsxHighlights
  | RequestImportExportMeta
  | RequestScssPrefixing
  | RequestToggledTsxComment
  | RequestReactRefreshTransform
);

export type MessageFromWorker = (
  | WorkerReady
  | SendTsxHighlights
  | SendImportExportMeta
  | SendPrefixedScss
  | SendTsxCommented
  | SendReactRefreshTransform
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
