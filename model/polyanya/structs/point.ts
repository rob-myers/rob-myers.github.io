import { EPSILON } from "./consts"

export default class Point {

  constructor(
    public x: number,
    public y: number,
  ) {}

  equals(other: Point) {
    return (Math.abs(this.x - other.x) < EPSILON) &&
      (Math.abs(this.y - other.y) < EPSILON);
  }

  notEquals(other: Point) {
    return !this.equals(other);
  }

  add(other: Point) {
    return new Point(this.x + other.x, this.y + other.y );
  }

  reverse() {
    return new Point(-this.x, -this.y);
  }

  sub(other: Point) {
    return new Point(this.x - other.x, this.y - other.y);
  }

  /**
   * Cross product i.e.
   * return the z component (as we are working in 2D).
   */
  cross(other: Point) {
    return this.x * other.y - this.y * other.x;
  }

  scale(mult: number) {
    return new Point(mult * this.x, mult * this.y);
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }

  distance_sq(other: Point) {
    return Math.pow(this.x-other.x, 2) + Math.pow(this.y - other.y, 2);
  }

  distance(other: Point) {
    return Math.sqrt(this.distance_sq(other));
  }
}