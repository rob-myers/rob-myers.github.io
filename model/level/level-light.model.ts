import { Poly2, Poly2Json } from '@model/poly2.model';
import { redact } from '@model/redux.model';
import { Vector2Json, Vector2 } from '@model/vec2.model';
import { Rect2 } from '@model/rect2.model';
import { lightPolygon } from './geom.model';

/** Optionally attached to a LevelMeta */
export class LevelLight {

  public get json(): LevelLightJson {
    return {
      position: this.position.json,
      range: this.range,
      polygon: this.polygon.json,
      sourceRatios: this.sourceRatios.json,
    };
  }
  
  /** Bounds of range of light. */
  public rangeBounds: Rect2;
  
  public get scale() {
    const dim  = Math.max(this.polygon.bounds.width, this.polygon.bounds.height);
    return (1 * this.range) / dim;
  }

  public get scaleX() {
    const dim  = Math.max(this.polygon.bounds.width, this.polygon.bounds.height);
    return this.polygon.bounds.width / dim;
  }
  
  public get scaleY() {
    const dim  = Math.max(this.polygon.bounds.width, this.polygon.bounds.height);
    return this.polygon.bounds.height / dim;
  }

  constructor(
    public position: Vector2,
    public range = 150,
    public polygon = redact(new Poly2()),
    /** e.g. (0.5, 0.5) means light positioned at center of polygon. */
    public sourceRatios = new Vector2(0.5, 0.5),
  ) {
    this.rangeBounds = Rect2.zero;
    this.setPosition(position);
  }

  public computePolygon(lineSegs: [Vector2, Vector2][]) {
    this.polygon = redact(lightPolygon(this.position, lineSegs));
    Poly2.removeColinear(this.polygon.points, 0.1);

    const { bounds } = this.polygon;
    this.sourceRatios = new Vector2(
      (this.position.x - bounds.x) / bounds.width,
      (this.position.y - bounds.y) / bounds.height,
    );
  }

  public clone() {
    return LevelLight.fromJson(this.json);
  }

  public static fromJson({ position, range, polygon, sourceRatios }: LevelLightJson): LevelLight {
    return new LevelLight(
      Vector2.from(position),
      range,
      redact(Poly2.fromJson(polygon)),
      Vector2.from(sourceRatios),
    );
  }

  public resetPolygon() {
    this.polygon = redact(new Poly2());
  }

  public setPosition(position: Vector2) {
    if (!position.equals(this.position)) {
      this.resetPolygon();
    }
    this.position.copy(position);
    this.rangeBounds = new Rect2(
      position.x - this.range,
      position.y - this.range,
      2 * this.range,
      2 * this.range,
    );
  }
}

export interface LevelLightJson {
  position: Vector2Json;
  range: number;
  polygon: Poly2Json;
  sourceRatios: Vector2Json;
}
