import { Redacted, redact } from '@model/redux.model';
import { Poly2 } from '@model/poly2.model';

export interface LevelState {
  key: string;
  /** Key format "${x},${y}" */
  grid: { [key: string]: undefined | true };
  /** Union of grid rects */
  gridPoly: Redacted<Poly2>;
  /** Walls induced by `gridPoly` */
  wallsPoly: Redacted<Poly2>;
}

export function createLevelState(uid: string): LevelState {
  return {
    key: uid,
    grid: {},
    gridPoly: redact(new Poly2),
    wallsPoly: redact(new Poly2),
  };
}