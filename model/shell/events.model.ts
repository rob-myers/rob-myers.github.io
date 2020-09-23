import type * as Geom from '@model/geom/geom.model';
import { geomService } from '@model/geom/geom.service';

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
);

/** Show a graphical representation */
interface ShowNavPath {
  key: 'show-navpath';
  name: string;
  points: Geom.VectorJson[];
}

export function handleWorldDeviceWrites(envKey: string, scene: THREE.Scene) {
  return (msg: MessageToWorld) => {
    console.log('worldDevice was written to', msg);

    if (msg.key === 'show-navpath') {
      scene.add(geomService.createPath(msg.points));
    }
  };
}
