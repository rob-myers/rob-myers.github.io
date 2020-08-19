import { Rect } from "./geom.model";
import { RectNavGraph } from "./rect-nav.model";

export interface GeomRootState {
  key: string;
  navGraphs: RectNavGraph[];
  /** How many GeomRoot components are tracking this state? */
  openCount: number;
  tables: Rect[];
  walls: Rect[];
}

export function createGeomRoot(geomKey: string): GeomRootState {
  return {
    key: geomKey,
    openCount: 1,
    navGraphs: [],
    tables: [],
    walls: [],
  };
}
