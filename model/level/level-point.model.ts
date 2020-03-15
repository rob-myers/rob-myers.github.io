import { Vector2, Vector2Json } from '@model/vec2.model';
import { Poly2, Poly2Json } from '@model/poly2.model';
import { Redacted, redact } from '@model/redux.model';

export class LevelPoint {
  
  public get json(): LevelPointJson {
    return {
      key: this.key,
      lightPoly: this.lightPoly.map(({ json }) => json),
      position: this.position.json,
      tags: this.tags.slice(),
    };
  }

  constructor(
    /** Unique identifier */
    public key: string,
    public position: Vector2,
    public tags = [] as string[],
    public lightPoly = [] as Redacted<Poly2>[],
  ) {}

  public static fromJson(json: LevelPointJson): LevelPoint {
    return new LevelPoint(
      json.key,
      Vector2.from(json.position),
      json.tags.slice(),
      json.lightPoly.map(x => redact(Poly2.fromJson(x)))
    );
  }
}

export interface LevelPointJson {
  key: string;
  position: Vector2Json;
  tags: string[];
  lightPoly: Poly2Json[];
}

export interface LevelPointUi {
  key: string;
  open: boolean;
  position: Vector2;
}
