import { Geometry as GeometryType, Face3 as Face3Type } from 'three/examples/jsm/deprecated/Geometry';
import { Geometry as GeometryClass, Face3 as Face3Class } from './Geometry';

export const Geometry = GeometryClass as any as GeometryType & {
  new(): GeometryType
};
export const Face3 = Face3Class as any as Face3Type & {
  new(a: number, b: number, c: number): Face3Type
};
