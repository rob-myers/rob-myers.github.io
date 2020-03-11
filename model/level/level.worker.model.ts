import { BaseMessage, Message } from '@model/worker.model';
import { Vector2Json } from '@model/vec2.model';
import { Poly2Json } from '@model/poly2.model';
import { TileMeta } from './level.model';
import { NavGraphJson } from '@model/nav/nav-graph.model';

/** A Worker instance in parent thread. */
export interface LevelWorker extends Worker {
  postMessage(message: MessageFromLevelParent): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromLevelWorker>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void;
  removeEventListener(type: 'message', listener: (message: Message<MessageFromLevelWorker>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void;

}

/** A web worker. */
export interface LevelWorkerContext extends Worker {
  postMessage(message: MessageFromLevelWorker): void;
  addEventListener(type: 'message', listener: (message: Message<MessageFromLevelParent>) => void): void;
  addEventListener(type: 'message', object: EventListenerObject): void; 
  removeEventListener(type: 'message', listener: (message: Message<MessageFromLevelParent>) => void): void;
  removeEventListener(type: 'message', object: EventListenerObject): void;
}

interface PingFromParent extends BaseMessage {
  key: 'ping-level-worker';
}
interface PongFromWorker extends BaseMessage {
  key: 'pong-from-level';
}

interface LevelWorkerReady extends BaseMessage {
  key: 'level-worker-ready';
}

interface RequestNewLevel extends BaseMessage {
  key: 'request-new-level';
  levelUid: string;
  tileDim: number;
}
interface RequestDestroyLevel extends BaseMessage {
  key: 'request-destroy-level';
  levelUid: string;
}
interface WorkerCreatedLevel extends BaseMessage {
  key: 'worker-created-level';
  levelUid: string;
}

export interface ToggleLevelTile extends BaseMessage {
  key: 'toggle-level-tile';
  levelUid: string;
  tile: Vector2Json;
}
interface SendLevelOutline extends BaseMessage {
  key: 'send-level-outline';
  levelUid: string;
  outlinePoly: Poly2Json[];
}

interface SendLevelWalls extends BaseMessage {
  key: 'send-level-walls';
  levelUid: string;
  walls: Poly2Json[];
  floors: Poly2Json[];
}

interface SendLevelTris extends BaseMessage {
  key: 'send-level-tris';
  levelUid: string;
  tris: Poly2Json[];
}

interface SendNavGraph extends BaseMessage {
  key: 'send-nav-graph';
  levelUid: string;
  navGraph: NavGraphJson;
  floors: Poly2Json[];
}

export interface ModifyLevelTile extends BaseMessage {
  key: 'modify-level-tile';
  levelUid: string;
  tile: Vector2Json;
  meta: TileMeta;
}

export type MessageFromLevelParent = (
  | PingFromParent
  | RequestNewLevel
  | RequestDestroyLevel
  | ToggleLevelTile
  | ModifyLevelTile
);
export type MessageFromLevelWorker = (
  | PongFromWorker
  | LevelWorkerReady
  | WorkerCreatedLevel
  | SendLevelOutline
  | SendLevelWalls
  | SendLevelTris
  | SendNavGraph
);

// Shortcut
type MsgFrmWrk<Key> = Extract<MessageFromLevelWorker, { key: Key }>

export async function awaitWorker<Key extends MessageFromLevelWorker['key']>(
  key: Key,
  worker: LevelWorker,
  /** Return truthy iff message received */
  isMessage: (message: MsgFrmWrk<Key>) => boolean = () => true,
  act?: (message: MsgFrmWrk<Key>) => void
): Promise<MsgFrmWrk<Key>> {
  return new Promise(resolve => {
    const listener = (message: Message<MessageFromLevelWorker>) => {
      if (message.data.key === key) {
        const data = message.data as MsgFrmWrk<Key>;
        if (isMessage(data)) {
          worker.removeEventListener('message', listener);
          act && act(data);
          resolve(data);
        }
      }
    };
    worker.addEventListener('message', listener);
  });
}
