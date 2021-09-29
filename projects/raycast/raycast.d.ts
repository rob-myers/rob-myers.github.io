declare namespace Raycast {

  export interface Mesh {
    ts: Geom.Triangulation[];
    /** Aligned to `ts` */
    metas: TriangulationMeta[];
  }

  export interface TriangulationMeta {
    /** Aligned to `tris` */
    tags: (undefined | string[])[];
  }

}