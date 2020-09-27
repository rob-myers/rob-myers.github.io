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
  path: Geom.VectorJson[];
  callback: (err: null | string) => void;
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
          director.toTween[msg.name] = null;
        }

        break;
      }
      case 'follow-path': {
        const director = useEnvStore.getState().director[envKey];

        // TODO can Ctrl-C path

        if (!(msg.name in director.toMesh)) {
          return msg.callback(`unknown actor "${msg.name}" cannot follow path`);
        } else if (msg.path.length <= 1) {
          return msg.callback(null);
        }

        const mesh = director.toMesh[msg.name];
        const path = msg.path.map(p => new Vector(p.x, p.y));

        const tweens = path.slice(0, -1).map((p, i) => new Tween.Tween(p)
          .to(path[i + 1], 500 * p.distTo(path[i + 1]) )
          .onUpdate(() => geomService.moveToXY(mesh, p))
          .onComplete(() => {
            director.tweenGrp.remove(tweens[i]);
            if (tweens[i + 1]) {
              director.tweenGrp.add(tweens[i + 1].start());
            } else {
              msg.callback(null);
            }
          })
        );

        director.tweenGrp.add(tweens[0].start());
        useEnvStore.api.awakenDirector(envKey);

        break;
      }
    }
  };
}
