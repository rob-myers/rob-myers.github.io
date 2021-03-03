/**
 * A two dimensional coordinate.
 */
export class Vector2 {

  public get angle() {
    return Math.atan2(this.y, this.x);
  }

  public get coord(): Coord {
    return [this.x, this.y];
  }

  public get json(): Vector2Json {
    return { x: this.x, y: this.y };
  }

  public get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public get lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }

  public static get zero() {
    return new Vector2(0, 0);
  }

  constructor(
    public x: number,
    public y: number,
  ) {}

  public add({ x, y }: Vector2Json): this {
    return this.translate(x, y);
  }

  public static average(vectors: Vector2[]) {
    return vectors.length
      ? vectors
        .reduce((agg, v) => agg.add(v), Vector2.zero)
        .scale(1 / vectors.length)
      : Vector2.zero;
  }

  public clone() {
    return new Vector2(this.x, this.y);
  }

  public copy(p: Vector2Json) {
    return this.set(p.x, p.y);
  }

  public distanceTo(p: Vector2Json) {
    return Math.sqrt(
      Math.pow(p.x - this.x, 2)
      + Math.pow(p.y - this.y, 2)
    );
  }

  public dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y;
  }

  public equals({ x, y }: Vector2) {
    return this.x === x && this.y === y;
  }

  public static from(coord: [number, number]): Vector2
  public static from({ x, y }: Vector2Json): Vector2
  public static from(input: Vector2Json | [number, number]) {
    return Array.isArray(input)
      ? new Vector2(input[0], input[1])
      : new Vector2(input.x, input.y);
  }

  public normalize(newLength = 1): Vector2 {
    if (this.length) {
      return this.scale(newLength / this.length);
    }
    console.error(
      `Cannot normalize Vector2 '${this}' to length '${newLength}'`
    );
    return this;
  }

  public rotate(radians: number) {
    const [x, y] = [this.x, this.y];
    this.x = Math.cos(radians) * x - Math.sin(radians) * y;
    this.y = Math.sin(radians) * x + Math.cos(radians) * y;
    return this;
  }

  public scale(amount: number): Vector2 {
    this.x *= amount;
    this.y *= amount;
    return this;
  }

  public set(x: number, y: number): Vector2 {
    this.x = x;
    this.y = y;
    return this;
  }

  public sub({ x, y }: Vector2Json): Vector2 {
    return this.translate(-x, -y);
  }

  public toString() {
    return `${this.x},${this.y}`;
  }

  public transform({ a, b, c, d, e, f }: DOMMatrix) {
    const { x, y } = this;
    this.x = a * x + c * y + e;
    this.y = b * x + d * y + f;
    return this;
  }

  public translate(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

}

export interface Vector2Json {
  x: number;
  y: number;
}

export type Coord = [number, number];
