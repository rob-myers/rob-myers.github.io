import Point from "./point";

export enum SuccessorType {
    RIGHT_NON_OBSERVABLE,
    OBSERVABLE,
    LEFT_NON_OBSERVABLE,
};

export default class Successor {

  constructor(
    public type: SuccessorType,
    public left: Point,
    public right: Point,
    // Used to get next_polygon (Polygon.polygons[left_ind])
    // as well as right_vertex (Polygon.vertices[left_ind - 1])
    public poly_left_ind: number,
  ) {}

  toString() {
    const lookup = [
      "RIGHT_NON_OBSERVABLE",
      "OBSERVABLE",
      "LEFT_NON_OBSERVABLE",
    ];
    return `Successor(${lookup[this.type]}, ${this.left} ${this.right}, poly_left=${this.poly_left_ind})`;
  }
};
