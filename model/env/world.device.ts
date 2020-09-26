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

interface FollowPath {
  key: 'follow-path';
  actorName: string;
  navPath: Geom.VectorJson[];
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
        const { name, position } = msg;
        const director = useEnvStore.getState().director[envKey];

        if (director.actors.includes(name)) {
          geomService.moveToXY(director.toMesh[name], position);
        } else {
          const mesh = useGeomStore.api.createActor(position, name);
          director.group.add(mesh);
          director.toMesh[name] = mesh;
          director.toTween[name] = null;
          director.actors.push(name);
        }
        break;
      }
      case 'follow-path': {
        break;
      }
    }
  };
}
