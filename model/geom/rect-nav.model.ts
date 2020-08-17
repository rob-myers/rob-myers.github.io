import { Polygon } from "./polygon.model";
import { Rect } from "./rect.model";
import { Vector } from "./vector.model";

export class RectNavGraph {
  /** n/s/e/w relative to '+y goes down screen' */
  public succ: Map<Rect, {
    all: Rect[];
    n: Rect[];
    e: Rect[];
    s: Rect[];
    w: Rect[];
  }>;

  public toPolygon: Map<Rect, Polygon>;

  constructor(public rects: Rect[]) {
    this.succ = new Map;
    this.toPolygon = new Map;

    const sort = (coord: 'x' | 'y', dir: 1 | -1) =>
      (a: Rect, b: Rect) => dir * (a[coord] <  b[coord] ? -1 : 1);

    this.rects.forEach(r => {
            
      const all = this.rects.filter(o => o !== r && o.intersects(r));
      this.succ.set(r, {
        all,
        n: all.filter(o => r.y === o.y + o.height).sort(sort('x', -1)),
        e: all.filter(o => r.x + r.width === o.x).sort(sort('y', 1)),
        s: all.filter(o => r.y + r.height === o.y).sort(sort('x', 1)),
        w: all.filter(o => r.x === o.x + o.width).sort(sort('y', -1)),
      });

      const { n, s, e, w } = this.succ.get(r)!;
      /**
       * Polyanya views +y as upwards and expects relatively anticlockwise polygons.
       * We agree with polyanya's convention, which is more conventional in mathematics.
       * North-east-south-west traversal is clockwise wrt y+ down, anticlockwise wrt y+ up.
       */
      this.toPolygon.set(r, new Polygon([
        // along north-side (left to right)
        r.nw, ...n.flatMap(o => [o.x > r.x && o.sw, o.e < r.e && o.se]).filter(Boolean) as Vector[],
        // along east-side (top to bottom)
        r.ne, ...e.flatMap(o => [o.y > r.y && o.nw, o.s < r.s && o.sw]).filter(Boolean) as Vector[],
        // along south-side (right to left)
        r.se, ...s.flatMap(o => [o.e < r.e && o.ne, o.x > r.x && o.nw]).filter(Boolean) as Vector[],
        // along west-side (bottom to top)
        r.sw, ...w.flatMap(o => [o.s < r.s && o.se, o.y > r.y && o.ne]).filter(Boolean) as Vector[],
      ]));
    });

  }

}
