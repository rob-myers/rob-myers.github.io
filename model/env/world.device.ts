import Tween from '@tweenjs/tween.js/dist/tween.cjs';
import type * as Geom from '@model/geom/geom.model';
import { geomService } from '@model/geom/geom.service';
import * as threeUtil from '@model/three/three.model';
import { Vector } from '@model/geom/geom.model';
import useGeomStore from "@store/geom.store";
import useEnvStore from "@store/env.store";

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
          useEnvStore.api.stopActorTween(envKey, msg.name);
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

        (async () => {
          const mesh = director.toMesh[msg.name];
          const path = msg.path.map(p => new Vector(p.x, p.y));
          let position = path.shift()!.clone();
          const updater = () => geomService.moveToXY(mesh, position);
          for (const target of path) {
            await asyncTween(position, target, updater, director.tweenGrp);
          }
          msg.callback(null);
        })();

        // processService.addCleanups() // TODO
        useEnvStore.api.awakenDirector(envKey);

        break;
      }
    }
  };
}

function asyncTween(
  from: Geom.Vector,
  to: Geom.Vector,
  updater: (current: Geom.VectorJson) => void,
  group: TWEEN.Group,
) {
  return new Promise((resolve) => {
    const tween = new Tween.Tween(from)
      .to(to, 500 * from.distTo(to))
      .onUpdate(updater)
      .onComplete(() => {
        group.remove(tween)
        resolve();
      })
      .start();
    group.add(tween);
  });
}
