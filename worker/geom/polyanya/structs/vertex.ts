import Point from "./point";

/** A point in the polygon mesh. */
export default class Vertex {
    constructor(
      public p: Point,
      public polygons: number[],
      public is_corner: boolean,
      public is_ambig: boolean,
    ) {}
};
