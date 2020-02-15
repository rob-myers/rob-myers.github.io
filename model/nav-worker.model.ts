import { Poly2Json } from '@model/poly2.model';
import { Rect2Json } from './rect2.model';

type NavToWorkerKey = (
  | 'ping?'
  | 'nav-dom?'
)
type NavFromWorkerKey = (
  | 'pong!'
  | 'nav-dom:outline!'
  | 'nav-dom:refined!'
)

type NavCallback<Data> = (data: Data) => void;
// type NavShouldCallback<Data, Memory = {}> = (data: Data, memory: Memory) => { matched: boolean; unregister?: true };

interface ParentContract<
  Sent extends { key: NavToWorkerKey; context: string },
  Received extends { key: NavFromWorkerKey; parentKey: Sent['key']; context: string },
> {
  /** Message from parent */
  message: Sent;
  /** Callback invoked by parent when reply received */
  callback: (data: Received) => void;
  /** Number of messages sent back */
  replyCount: number;
}

type PingPongContract = ParentContract<
  { key: 'ping?'; context: string },
  { key: 'pong!'; parentKey: 'ping?'; context: string }
>;

export type NavDomContract = ParentContract<
  {
    key: 'nav-dom?';
    /** NavDom uid */
    context: string;
    /** World bounds */
    bounds: Rect2Json;
    /** Rectangles in world coords */
    rects: Rect2Json[];
    /** Polygons in world coords */
    polys: Poly2Json[];
  },
  (
    { parentKey: 'nav-dom?'; context: string } & (
      {
        key: 'nav-dom:outline!';
        /** Navigable multipolygon with triangulation */
        navPolys: Poly2Json[];
      } | {
        key: 'nav-dom:refined!';
        /** Refined navigable multipolygon with Steiner points */
        refinedNavPolys: Poly2Json[];
      }
    )
  )
>;

type NavWorkerContracts = (
  | PingPongContract
  | NavDomContract
);

type NavDataFromParent = NavWorkerContracts['message'];
type NavDataFromWorker = Parameters<NavWorkerContracts['callback']>[0];

interface NavMessageFromWorker extends MessageEvent {
  data: NavDataFromWorker;
}
interface NavMessageFromParent extends MessageEvent {
  data: NavDataFromParent;
}

/**
 * A Worker instance in parent thread.
 */
export interface NavWorker extends Worker {
  postMessage(message: NavDataFromParent): void;
  addEventListener(type: 'message', listener: (message: NavMessageFromWorker) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
}

/**
 * A web worker.
 */
export interface NavWorkerContext extends Worker {
  postMessage(message: NavDataFromWorker): void;
  addEventListener(type: 'message', listener: (message: NavMessageFromParent) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
}

/**
 * Register parent-side of contract.
 */
export function registerNavContract<Contract extends NavWorkerContracts>(
  worker: NavWorker,
  { callback, message, replyCount }: Contract,
) {
  let replies = 0;
  const handleMessage = ({ data }: NavMessageFromWorker) => {
    if (data.parentKey === message.key && data.context === message.context) {
      (callback as (data: NavDataFromWorker) => void)(data);
      (++replies >= replyCount) && worker.removeEventListener('message', handleMessage);
    }
  };

  worker.addEventListener('message', handleMessage);
  worker.postMessage(message);
}
