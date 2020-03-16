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
    };
  }
  
  /** Bounds of range of light. */
  public rangeBounds: Rect2;
  /** e.g. (0.5, 0.5) means light positioned at center of polygon. */
  public sourceRatios: Vector2;

  constructor(
    public position: Vector2,
    public range = 100,
    public polygon = redact(new Poly2()),
  ) {
    this.polygon = redact(new Poly2());
    this.rangeBounds = new Rect2(
      position.x - range, position.y - range,
      2 * range, 2 * range,
    );
    this.sourceRatios = new Vector2(0.5, 0.5);
  }

  public computePolygon(
    /** Triangulation of walls. */
    triangles: Poly2[]
  ) {
    this.polygon = redact(lightPolygon(this.position, this.range, triangles));
    const { bounds } = this.polygon;
    this.sourceRatios = new Vector2(
      (this.position.x - bounds.x) / bounds.width,
      (this.position.y - bounds.y) / bounds.height,
    );
    
  }

  public static fromJson({ position, range, polygon }: LevelLightJson): LevelLight {
    return new LevelLight(
      Vector2.from(position),
      range,
      redact(Poly2.fromJson(polygon)),
    );
  }
}

export interface LevelLightJson {
  position: Vector2Json;
  range: number;
  polygon: Poly2Json;
}
