import type * as Geom from '@model/geom/geom.model';
import { geomService } from '@model/geom/geom.service';
import * as threeUtil from '@model/three/three.model';
import useEnvStore from "@store/env.store";
import { actorService } from './actor.service';
import { worldService } from './world.service';

export type MessageFromWorld = (
  | NavmeshClick
);

export interface NavmeshClick {
  key: 'nav-click';
  x: number;
  y: number;
}

export type MessageToWorld = (
  | ShowNavPath
  | SpawnActor
  | ActorFollowPath
  | SetCameraFree
  | SetCameraFollow
);

/** Show a graphical representation */
interface ShowNavPath {
  key: 'show-navpath';
  name: string;
  points: Geom.VectorJson[];
}

interface SpawnActor {
  key: 'spawn-actor';
  name: string;
  position: Geom.VectorJson;
}

export interface ActorFollowPath {
  key: 'actor-follow-path';
  /** Actor's name */
  name: string;
  /** Navpath to follow, starting from actor's position */
  path: Geom.VectorJson[];
  /** Invoked on error or when finished */
  callback: (err: null | string) => void;
  /** For Ctrl-C */
  pid: number;
}

interface SetCameraFree {
  key: 'set-camera-free';
}

interface SetCameraFollow {
  key: 'set-camera-follow';
  actorName: string;
}

export function handleWorldDeviceWrites(envKey: string) {
  return (msg: MessageToWorld) => {
    // console.log('worldDevice was written to', msg);

    switch (msg.key) {
      case 'show-navpath': {
        const { indicators } = useEnvStore.getState().decorator[envKey];
        const previous = threeUtil.getChild(indicators, msg.name);
        previous && indicators.remove(previous);
        indicators.add(geomService.createPath(msg.points, msg.name));
        break;
      }
      case 'spawn-actor': {
        actorService.spawn(envKey, msg.name, msg.position);
        break;
      }
      case 'actor-follow-path': {
        actorService.followPath(envKey, msg.pid, msg.name, msg.path, msg.callback);
        break;
      }
      case 'set-camera-free': {
        worldService.setCameraFree(envKey);
        break;
      }
      case 'set-camera-follow': {
        worldService.setCameraFollow(envKey, msg.actorName);
        break;
      }
    }
  };
}
