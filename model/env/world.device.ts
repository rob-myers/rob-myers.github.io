import anime from 'animejs';

import type * as Geom from '@model/geom/geom.model';
import { geomService } from '@model/geom/geom.service';
import * as threeUtil from '@model/three/three.model';
import { Vector } from '@model/geom/geom.model';
import useGeomStore from "@store/geom.store";
import useEnvStore from "@store/env.store";
import { removeFirst } from '@model/generic.model';
import { processService as ps } from '@model/shell/process.service';

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
        const director = useEnvStore.getState().director[envKey];
        if (msg.name in director.toMesh) {
          geomService.moveToXY(director.toMesh[msg.name], msg.position);
        } else {
          const mesh = useGeomStore.api.createActor(msg.position, msg.name);
          director.actorsGrp.add(mesh);
          director.toMesh[msg.name] = mesh;
        }
        break;
      }
      case 'follow-path': {
        const director = useEnvStore.getState().director[envKey];

        if (!(msg.name in director.toMesh)) {
          return msg.callback(`unknown actor "${msg.name}" cannot follow path`);
        } else if (msg.path.length <= 1) {
          return msg.callback(null);
        }

        // Cancel any currently running timeline
        if (msg.name in director.toCancel) {
          director.toCancel[msg.name]();
        }

        const mesh = director.toMesh[msg.name];
        const path = msg.path.map(p => new Vector(p.x, p.y));
        const position = path[0].clone();

        // TODO rotation via absolute offsets (just before turn)
        // No need for easing though

        const timeline = anime.timeline({
          targets: position,
          easing: 'linear',
          update: () => geomService.moveToXY(mesh, position),
        });
        path.slice(1).forEach((target, i) => timeline.add({
          x: target.x,
          y: target.y,
          duration: 600 * path[i].distTo(target),
          easing: 'linear',
        }));


        // We race to handle Ctrl-C and cancellation by other process
        Promise.race([
          timeline.finished,
          new Promise((_, reject) => {
            ps.addCleanups(msg.pid, reject);
            director.toCancel[msg.name] = reject;
          }),
        ]).then(() => msg.callback(null))
          .catch(() => {
            timeline.pause(); // TODO dispose animations?
            msg.callback(`${msg.name}: goto was cancelled`)
          })
          .finally(() => delete director.toCancel[msg.name]);

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
