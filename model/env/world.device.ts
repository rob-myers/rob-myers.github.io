import type * as Geom from '@model/geom/geom.model';
import { geomService } from '@model/geom/geom.service';
import * as threeUtil from '@model/three/three.model';
import useGeomStore from "@store/geom.store";

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

export function handleWorldDeviceWrites(envKey: string, scene: THREE.Scene) {
  return (msg: MessageToWorld) => {
    console.log('worldDevice was written to', msg);

    switch (msg.key) {
      case 'show-navpath': {
        const indicators = threeUtil.getChild(scene, 'indicators')!;
        const previous = threeUtil.getChild(indicators, msg.name);
        previous && indicators.remove(previous);
        indicators.add(geomService.createPath(msg.points, name));
        break;
      }
      case 'spawn-actor': {
        const actors = threeUtil.getChild(scene, 'actors')!;
        const previous = threeUtil.getChild(actors, msg.name);
        if (previous) {
          geomService.moveToXY(previous, msg.position);
        } else {
          actors.add(useGeomStore.api.createActor(msg.position, msg.name));
        }
        break;
      }
      case 'follow-path': {
        break;
      }
    }
  };
}
