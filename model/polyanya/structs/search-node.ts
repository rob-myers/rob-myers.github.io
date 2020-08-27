import Point from "./point";
/**
 * A search node.
 * Only makes sense given a mesh and an endpoint, which the node does not store.
 * This means that the f value needs to be set manually.
 */
export default class SearchNode {

  constructor(
    public parent: null | SearchNode,
    /** Note that all Points here will be in terms of a Cartesian plane. */
    public root: number, // -1 if start
    /**
     * If possible, set the orientation of left / root / right to be
     * "if I'm standing at 'root' and look at 'left', 'right' is on my right"
     */
    public left: Point,
    public right: Point,
    /**
     * The left vertex of the edge the interval is lying on.
     * When generating the successors of this node, end there.
     */
    public left_vertex: number,
    /**
     * The right vertex of the edge the interval is lying on.
     * When generating the successors of this node, start there.
     */
    public right_vertex: number,
    /**
     * Index of the polygon we're going to "push" into.
     * Every successor must lie within this polygon.
     */
    public next_polygon: number,
    public f: number,
    public g: number,
  ) {}

  /**
   * Comparison.
   * Always take the "smallest" search node in a priority queue.
   */
  lessThan(other: SearchNode) {
    if (this.f === other.f) {
      // If two nodes have the same f, the one with the bigger g
      // is "smaller" to us.
      return this.g > other.g;
    }
    return this.f < other.f;
  }

  greaterThan(other: SearchNode) {
    if (this.f === other.f) {
      return this.g < other.g;
    }
    return this.f > other.f;
  }

  toString() {
    return `SearchNode ([${this.root}, [${this.left}, ${this.right}]], f=${
      this.f
    }, g=${this.g}, poly="${this.next_polygon})`;
  }
};
