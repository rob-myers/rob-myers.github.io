import { Poly2Json } from '@model/poly2.model';
import { Rect2Json } from '../rect2.model';
import { KeyedUnionToLookup } from '../generic.model';
import { NavGraphJson } from './nav-graph.model';
import { BaseMessage } from '@model/worker.model';

/** A Worker instance in parent thread. */
export interface NavWorker extends Worker {
  postMessage(message: NavDataFromParent): void;
  addEventListener(type: 'message', listener: (message: NavMessageFromWorker) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
}

/** A web worker. */
export interface NavWorkerContext extends Worker {
  postMessage(message: NavDataFromWorker): void;
  addEventListener(type: 'message', listener: (message: NavMessageFromParent) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
}

interface PingFromParent extends BaseMessage {
  key: 'ping-nav';
}
interface PongFromWorker extends BaseMessage {
  key: 'pong-from-nav';
}

interface RequestNavData extends BaseMessage {
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
interface SendNavOutline extends BaseMessage {
  key: 'send-nav-outline';
  /** Navigable multipolygon with triangulation */
  navPolys: Poly2Json[];
}
/** In future might not send this. */
interface SendRefinedNav extends BaseMessage {
  key: 'send-refined-nav';
  /** Refined navigable multipolygon with Steiner points */
  refinedNavPolys: Poly2Json[];
}
interface SendNavGraph extends BaseMessage {
  key: 'send-nav-graph';
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

// OLD BELOW
//

type NavToWorkerKey = (
  | 'ping?'
  | 'nav-dom?'
)
type NavFromWorkerKey = (
  | 'pong!'
  | 'nav-dom:outline!'
  | 'nav-dom:refined!'
  | 'nav-dom:nav-graph!'
)

type GetKeyedCallbacks<T extends { key: string }> = T extends any
  ? { key: T['key']; do: ((reply: T) => void) } : never;

interface ParentContract<
  Sent extends { key: NavToWorkerKey; context: string },
  Received extends { key: NavFromWorkerKey; parentKey: Sent['key']; context: string },
> {
  /** Message from parent */
  message: Sent;
  /** Action to perform for specific reply */
  on: KeyedUnionToLookup<GetKeyedCallbacks<Received>>;
  /** Action to perform for any reply */
  onAny?: (reply: Received) => void;
}

type PingPongContract = ParentContract<
  { key: 'ping?'; context: string },
  { key: 'pong!'; parentKey: 'ping?'; context: string }
>;

export type NavDomContract = ParentContract<
  {
    key: 'nav-dom?';
    /** World bounds */
    bounds: Rect2Json;
    /** NavDom uid */
    context: string;
    navOutset: number;
    /** Rectangles in world coords */
    rects: Rect2Json[];
    spawns: Rect2Json[];
    debug?: boolean;
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
      } | {
        key: 'nav-dom:nav-graph!';
        /** Refined navigable multipolygon with Steiner points */
        navGraph: NavGraphJson;
      }
    )
  )
>;

type NavWorkerContracts = (
  | PingPongContract
  | NavDomContract
);

type NavDataFromParent = NavWorkerContracts['message'];
type NavDataFromWorker = Parameters<NonNullable<NavWorkerContracts['onAny']>>[0];

interface NavMessageFromWorker extends MessageEvent {
  data: NavDataFromWorker;
}
interface NavMessageFromParent extends MessageEvent {
  data: NavDataFromParent;
}


/**
 * Register parent-side of contract.
 * TODO generic version, independent of nav.
 */
export async function navWorkerMessages<Contract extends NavWorkerContracts>(
  worker: NavWorker,
  contract: Contract,
) {
  const on = { ...contract.on } as Record<string, { do: (x: NavDataFromWorker ) => void }>;
  const { message, onAny } = contract;

  await new Promise(resolve => {
    const handleMessage = ({ data }: NavMessageFromWorker) => {
      if (data.parentKey === message.key && data.context === message.context) {
        on[data.key].do(data);
        if (onAny) (onAny as (data: NavDataFromWorker) => void)(data);
  
        // Unregister once all replies received 
        delete on[data.key];
        if (!Object.keys(on).length) {
          worker.removeEventListener('message', handleMessage);
          resolve();
        }
      }
    };
  
    worker.addEventListener('message', handleMessage);
    worker.postMessage(message);
  });

}
