import { Rect } from "./geom.model";

export interface GeomRootState {
  key: string;
  /** How many GeomRoot components are tracking this state? */
  openCount: number;
  tables: Rect[];
  walls: Rect[];
}

export function createGeomRoot(geomKey: string): GeomRootState {
  return {
    key: geomKey,
    openCount: 1,
    tables: [],
    walls: [],
  };
}
