import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseMessage, Message } from '@model/worker.model';
import { Vector2Json } from '@model/vec2.model';
import { Poly2Json } from '@model/poly2.model';
import { NavPathJson } from '@model/level/nav/nav-path.model';
import { KeyedLookup } from '@model/generic.model';
import { Rect2Json } from '@model/rect2.model';
import { LevelMetaUpdate, LevelMetaGroupJson } from './level-meta.model';

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

interface RequestNavRects extends BaseMessage {
  key: 'request-nav-rects';
  levelUid: string;
}
interface SendLevelNavRects extends BaseMessage {
  key: 'send-level-nav-rects';
  levelUid: string;
  rects: Rect2Json[];
}

interface AddLevelMeta extends BaseMessage {
  key: 'add-level-meta';
  levelUid: string;
  position: Vector2Json;
  metaGroupKey: string;
  metaKey: string;
}
export interface DuplicateLevelMeta extends BaseMessage {
  key: 'duplicate-level-meta';
  levelUid: string;
  position: Vector2Json;
  metaGroupKey: string;
  newMetaGroupKey: string;
}
export interface RemoveLevelMeta extends BaseMessage {
  key: 'remove-level-meta';
  levelUid: string;
  metaGroupKey: string;
  metaKey: null | string;
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
  metas: LevelMetaGroupJson[];
}
export interface UpdateLevelMeta extends BaseMessage {
  key: 'update-level-meta';
  levelUid: string;
  metaGroupKey: string;
  update: LevelMetaUpdate;
}

interface EnsureFloydWarshall extends BaseMessage {
  key: 'ensure-floyd-warshall';
  levelUid: string;
}
export interface FloydWarshallReady extends BaseMessage {
  key: 'floyd-warshall-ready';
  levelUid: string;
  changed: boolean;
  nodeCount: number;
  edgeCount: number;
  /** Number of disjoint areas */
  areaCount: number;
}

interface RequestNavPath extends BaseMessage {
  key: 'request-nav-path';
  levelUid: string;
  navPathUid: string;
  src: Vector2Json;
  dst: Vector2Json;
}
interface SendNavPath extends BaseMessage {
  key: 'send-nav-path';
  levelUid: string;
  navPath: NavPathJson;
}
interface SendLevelAux extends BaseMessage {
  key: 'send-level-aux';
  levelUid: string;
  toNavPath: KeyedLookup<NavPathJson>;
  // ...
}

export type MessageFromLevelParent = (
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
  | EnsureFloydWarshall
  | RequestNavPath
  | RequestNavRects
);

export type MessageFromLevelWorker = (
  | LevelWorkerReady
  | WorkerCreatedLevel
  | SendLevelLayers
  | SendLevelNavFloors
  | SendLevelTris
  | SendLevelMetas
  | FloydWarshallReady
  | SendNavPath
  | SendLevelAux
  | SendLevelNavRects
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
