import { Vector2, Vector2Json } from '@model/vec2.model';

export class NavPath {

  public get edges() {
    return this.points.reduce<{ src: Vector2; dst: Vector2}[]>(
      (agg, p, i, ps) => i === ps.length - 1
        ? agg
        : agg.concat({ src: p, dst: ps[i + 1] }),
      [],
    );
  }

  public get json(): NavPathJson {
    return {
      key: this.key,
      points: this.points.map(p => p.json),
    };
  }

  constructor(
    public key: string,
    public points: Vector2[],
  ) {}

  public static from({ key, points }: NavPathJson) {
    return new NavPath(
      key,
      points.map(p => Vector2.from(p)),
    );
  }

}

export interface NavPathJson {
  key: string;
  points: Vector2Json[];
}
