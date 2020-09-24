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
  | ShowNavPath
  | SpawnActor
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

export function handleWorldDeviceWrites(envKey: string, scene: THREE.Scene) {
  return (msg: MessageToWorld) => {
    console.log('worldDevice was written to', msg);

    if (msg.key === 'show-navpath') {
      const indicators = threeUtil.getChild(scene, 'indicators')!;
      const previous = threeUtil.getChild(indicators, msg.name);
      previous && indicators.remove(previous);
      indicators.add(geomService.createPath(msg.points, name));
    } else if (msg.key === 'spawn-actor') {
      const actors = threeUtil.getChild(scene, 'actors')!;
      const previous = threeUtil.getChild(actors, msg.name);
      previous && actors.remove(previous);
      actors.add(useGeomStore.api.createActor(msg.position, msg.name));
    }
  };
}
