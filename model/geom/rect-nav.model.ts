import { Rect, RectJson } from "./rect.model";

export const navInset = 10;
export const navBoundsOutset = 50;

export class RectNavGraph {

  /** n/s/e/w relative to '+y goes down screen' */
  public succ: Map<Rect, {
    all: Rect[];
    n: Rect[];
    e: Rect[];
    s: Rect[];
    w: Rect[];
  }>;

  constructor(public rects: Rect[]) {
    this.succ = new Map;
  }

  public compute() {
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
    });

    return this;
  }

  public static from({ rects, succ }: RectNavGraphJson) {
    const output = new RectNavGraph(rects.map(x => Rect.from(x)));
    succ.forEach(([key, value]) => output.succ.set(Rect.from(key), {
      all: value.all.map(x => Rect.from(x)),
      n: value.n.map(x => Rect.from(x)),
      e: value.e.map(x => Rect.from(x)),
      s: value.s.map(x => Rect.from(x)),
      w: value.w.map(x => Rect.from(x)),
    }));
    return output;
  }

  public get json(): RectNavGraphJson {
    return {
      rects: this.rects.map(x => x.json),
      succ: Array.from(this.succ.entries())
        .map(([src, { all, n, e, s, w }]) => [
          src.json, {
            all: all.map(x => x.json),
            n: n.map(x => x.json),
            e: e.map(x => x.json),
            s: s.map(x => x.json),
            w: w.map(x => x.json),
          }
        ]),
    };
  }

}

export interface RectNavGraphJson {
  rects: RectJson[];
  succ: [RectJson, {
    all: RectJson[];
    n: RectJson[];
    e: RectJson[];
    s: RectJson[];
    w: RectJson[];
  }][],
}

export interface NavInput {
  tables: RectJson[];
  walls: RectJson[];
}