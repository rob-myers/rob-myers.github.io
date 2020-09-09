import { VectorJson } from "@model/geom/geom.model";

export interface NavmeshClick {
  key: 'navmesh-click';
  /** Position clicked on navmesh */
  position: VectorJson;
}

export type WorldEvent = (
  | NavmeshClick
);
