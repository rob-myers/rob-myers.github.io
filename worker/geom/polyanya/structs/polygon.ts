/** A convex polygon */
export default class Polygon {
  constructor(
    /** Indices of respective vertices stored in mesh */
    public vertices: number[],
    /** Indices of adjacent polygons or `-1` */
    public polygons: number[],
    public min_x: number,
    public max_x: number,
    public min_y: number,
    public max_y: number,
    /**
     * True iff this polygon is isolated or has 1 neighbour.
     * That is, `polygons` has at most one non-negative entry.
     */
    public is_one_way: boolean,
  ) {}
};