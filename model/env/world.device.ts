import anime from 'animejs';

import type * as Geom from '@model/geom/geom.model';
import { geomService } from '@model/geom/geom.service';
import * as threeUtil from '@model/three/three.model';
import { Vector } from '@model/geom/geom.model';
import useEnvStore from "@store/env.store";
import { removeFirst } from '@model/generic.model';
import { processService as ps } from '@model/shell/process.service';
import { actorService } from './actor.service';

export type MessageFromWorld = (
  | NavmeshClick
);

export interface NavmeshClick {
  key: 'nav-click';
  x: number;
  y: number;
}

export type MessageToWorld = (
  | ShowNavPath // TODO VectorJson[] instead
  | SpawnActor
  | FollowPath
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

export interface FollowPath {
  key: 'follow-path';
  /** Actor's name */
  name: string;
  /** Navpath to follow, starting from actor's position */
  path: Geom.VectorJson[];
  /** Invoked on error or when finished */
  callback: (err: null | string) => void;
  /** For Ctrl-C */
  pid: number;
}

export function handleWorldDeviceWrites(envKey: string) {
  return (msg: MessageToWorld) => {
    console.log('worldDevice was written to', msg);

    switch (msg.key) {
      case 'show-navpath': {
        const { indicators } = useEnvStore.getState().decorator[envKey];
        const previous = threeUtil.getChild(indicators, msg.name);
        previous && indicators.remove(previous);
        indicators.add(geomService.createPath(msg.points, name));
        break;
      }
      case 'spawn-actor': {
        actorService.spawn(envKey, msg.name, msg.position);
        break;
      }
      case 'follow-path': {
        actorService.followPath(envKey, msg.pid, msg.name, msg.path, msg.callback);
        break;
      }
    }
  };
}

/** https://github.com/juliangarnier/anime/issues/188#issuecomment-621589326 */
function cancelAnimation (animation: anime.AnimeInstance) {
  removeFirst(anime.running, animation);
  animation.pause();
}
