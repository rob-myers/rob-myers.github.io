import { Poly2Json } from '@model/poly2.model';
import { Rect2Json } from '../rect2.model';
import { NavGraphJson } from './nav-graph.model';
import { BaseMessage, Message } from '@model/worker.model';

/** A Worker instance in parent thread. */
export interface NavWorker extends Worker {
  postMessage(message: MessageFromNavParent): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromNavWorker>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
}

/** A web worker. */
export interface NavWorkerContext extends Worker {
  postMessage(message: MessageFromNavWorker): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromNavParent>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
}

interface PingFromParent extends BaseMessage {
  key: 'ping-nav';
}
interface PongFromWorker extends BaseMessage {
  key: 'pong-from-nav';
}

export interface RequestNavData extends BaseMessage {
  key: 'request-nav-data';
  /** World bounds */
  bounds: Rect2Json;
  /** NavDom uid */
  navUid: string;
  navOutset: number;
  /** Rectangles in world coords */
  rects: Rect2Json[];
  spawns: Rect2Json[];
  debug?: boolean;
}

export interface SendNavOutline extends BaseMessage {
  key: 'send-nav-outline';
  /** NavDom uid */
  navUid: string;
  /** Navigable multipolygon with triangulation */
  navPolys: Poly2Json[];
}

/** In future might not send this. */
export interface SendRefinedNav extends BaseMessage {
  key: 'send-refined-nav';
  /** NavDom uid */
  navUid: string;
  /** Refined navigable multipolygon with Steiner points */
  refinedNavPolys: Poly2Json[];
}
export interface SendNavGraph extends BaseMessage {
  key: 'send-nav-graph';
  /** NavDom uid */
  navUid: string;
  navGraph: NavGraphJson;
}

export type MessageFromNavParent = (
  | PingFromParent
  | RequestNavData
);
export type MessageFromNavWorker = (
  | PongFromWorker
  | SendNavOutline
  | SendRefinedNav
  | SendNavGraph
);

export async function awaitWorker<T extends MessageFromNavWorker>(
  worker: NavWorker,
  /** Return truthy iff message received */
  isMessage: (message: Message<MessageFromNavWorker>) => boolean,
  act?: (message: T) => void
): Promise<T> {
  return new Promise(resolve => {
    const listener = (message: Message<MessageFromNavWorker>) => {
      if (isMessage(message)) {
        worker.removeEventListener('message', listener);
        act && act(message.data as T);
        resolve(message.data as T);
      }
    };
    worker.addEventListener('message', listener);
  });
}
