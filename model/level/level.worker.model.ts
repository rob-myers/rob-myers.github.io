import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseMessage, Message } from '@model/worker.model';
import { Vector2Json } from '@model/vec2.model';
import { Poly2Json } from '@model/poly2.model';
import { NavGraphJson } from '@model/nav/nav-graph.model';
import { LevelMetaJson, LevelMetaUpdate } from './level-meta.model';

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
  type: 'small' | 'large';
}
export interface ToggleLevelWall extends BaseMessage {
  key: 'toggle-level-wall';
  levelUid: string;
  segs: [Vector2Json, Vector2Json][];
}

interface SendLevelLayers extends BaseMessage {
  key: 'send-level-layers';
  levelUid: string;
  tileFloors: Poly2Json[];
  wallSegs: [Vector2Json, Vector2Json][];
}

interface SendLevelNavFloors extends BaseMessage {
  key: 'send-level-nav-floors';
  levelUid: string;
  navFloors: Poly2Json[];
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

interface AddLevelMeta extends BaseMessage {
  key: 'add-level-meta';
  levelUid: string;
  position: Vector2Json;
  metaKey: string;
}
export interface DuplicateLevelMeta extends BaseMessage {
  key: 'duplicate-level-meta';
  levelUid: string;
  position: Vector2Json;
  metaKey: string;
  newMetaKey: string;
}
export interface RemoveLevelMeta extends BaseMessage {
  key: 'remove-level-meta';
  levelUid: string;
  metaKey: string;
}
interface RequestLevelData extends BaseMessage {
  key: 'request-level-data';
  levelUid: string;
}
interface RequestLevelMetas extends BaseMessage {
  key: 'request-level-metas';
  levelUid: string;
}
interface SendLevelMetas extends BaseMessage {
  key: 'send-level-metas';
  levelUid: string;
  metas: LevelMetaJson[];
}
export interface UpdateLevelMeta extends BaseMessage {
  key: 'update-level-meta';
  levelUid: string;
  metaKey: string;
  update: LevelMetaUpdate;
}

export type MessageFromLevelParent = (
  | PingFromParent
  | RequestNewLevel
  | RequestDestroyLevel
  | ToggleLevelTile
  | ToggleLevelWall
  | AddLevelMeta
  | DuplicateLevelMeta
  | RequestLevelData
  | RequestLevelMetas
  | UpdateLevelMeta
  | RemoveLevelMeta
);
export type MessageFromLevelWorker = (
  | PongFromWorker
  | LevelWorkerReady
  | WorkerCreatedLevel
  | SendLevelLayers
  | SendLevelNavFloors
  | SendLevelTris
  | SendNavGraph
  | SendLevelMetas
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

export function subscribeToWorker(
  worker: LevelWorker,
  handler: (msg: MessageFromLevelWorker) => void, 
) {
  return fromEvent<Message<MessageFromLevelWorker>>(worker, 'message')
    .pipe(
      map(({ data }) => data),
      tap(handler)
    ).subscribe();
}
