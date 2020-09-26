import Tween from '@tweenjs/tween.js/dist/tween.cjs';
import { removeFirst } from '@model/generic.model';
import type * as Geom from '@model/geom/geom.model';
import { geomService } from '@model/geom/geom.service';
import * as threeUtil from '@model/three/three.model';
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
          director.group.add(mesh);
          director.toMesh[msg.name] = mesh;
          director.toTween[msg.name] = null;
          // director.activeActors.push(msg.name);
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

        const mesh = director.toMesh[msg.name];
        director.toTween[msg.name]?.stop(); // Needed?

        // Configure tween
        const position = { x: mesh.position.x, y: mesh.position.y };
        const tween = new Tween.Tween(position)
          .to({ x: msg.path[1].x, y: msg.path[1].y }, 2000);
        tween.onUpdate(() => {
          mesh.position.setX(position.x);
          mesh.position.setY(position.y);
        });
        tween.onComplete(() => {
          msg.callback(null);
          removeFirst(director.activeActors, msg.name);
          director.toTween[msg.name] = null;
        });
        tween.start();

        director.toTween[msg.name] = tween;
        if (!director.activeActors.includes(msg.name)) {
          director.activeActors.push(msg.name);
        }
        useEnvStore.api.awakenDirector(envKey);

        break;
      }
    }
  };
}
