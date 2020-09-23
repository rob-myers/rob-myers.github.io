import type * as Geom from '@model/geom/geom.model';

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

export function handleWorldDeviceWrites(envKey: string) {
  return (msg: MessageToWorld) => {
    console.log('worldDevice was written to', msg);
  };
}
