import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Message } from '@model/worker.model';
import { BipartiteGraph, BipartiteEdge } from '@model/geom/bipartite.model';
import { PolygonJson, Rect, NavInput, RectNavGraphJson } from '@model/geom/geom.model';

interface RequestStatus {
  key: 'request-status';
}
interface GetMaxMatching {
  key: 'get-max-matching';
  graphKey: string;
  graph: BipartiteGraph;
}
interface GetRectDecompose {
  key: 'get-rect-decompose';
  polygonKey: string;
  /** Rectilinear with integer coords */
  polygon: PolygonJson;
}
interface GetRectNavGraph {
  key: 'get-rect-navgraph';
  graphKey: string;
  navInput: NavInput;
}

interface SendWorkerReady {
  key: 'worker-ready';
}
interface SendMaxMatching {
  key: 'send-max-matching';
  graphKey: string;
  edges: BipartiteEdge[];
}
interface SendRectDecompose {
  key: 'send-rect-decompose';
  polygonKey: string;
  rects: Rect[];
}
interface SendRectNavGraph {
  key: 'send-rect-navgraph';
  graphKey: string;
  navGraphs: RectNavGraphJson[];
}

type MessageFromParent = (
  | RequestStatus
  | GetMaxMatching
  | GetRectDecompose
  | GetRectNavGraph
);

export type MessageFromWorker = (
  | SendWorkerReady
  | SendMaxMatching
  | SendRectDecompose
  | SendRectNavGraph
);

/** A Worker instance in main thread. */
export interface GeomWorker extends Worker {
  postMessage(message: MessageFromParent): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromWorker>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
  removeEventListener(type: 'message', listener: (message: Message<MessageFromWorker>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void;
}

/** A web worker. */
export interface GeomWorkerContext extends Worker {
  postMessage(message: MessageFromWorker): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromParent>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
  removeEventListener(type: 'message', listener: (message: Message<MessageFromParent>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void;
}

type RefinedMessage<Key> = Extract<MessageFromWorker, { key: Key }>

export async function awaitWorker<Key extends MessageFromWorker['key']>(
  key: Key,
  worker: GeomWorker,
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
  worker: GeomWorker,
  handler: (msg: MessageFromWorker) => void, 
) {
  return fromEvent<Message<MessageFromWorker>>(worker, 'message')
    .pipe(
      map(({ data }) => data),
      tap(handler)
    ).subscribe();
}
