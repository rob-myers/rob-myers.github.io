import rectDecompose from 'rectangle-decomposition';
import { mapValues } from '@model/generic.model';
import { Vector2, Vector2Json } from '@model/vec2.model';
import { Rect2 } from '@model/rect2.model';
import { Poly2 } from '@model/poly2.model';
import { BaseNodeOpts, BaseNode, BaseEdgeOpts, BaseEdge, BaseGraph } from '@model/graph.model';
import { LevelMeta } from '../level-meta.model';

interface ViewNodeOpts extends BaseNodeOpts {
  /** `${rect}` */
  id: string;
  rect: Rect2;
  /** Keys of metas which overlap `rect` */
  metaKeys: string[];
  /** Ids of edges from `id` **/
  edgeKeys: {
    /** Keys of edges to rectangles above `rect`. */
    top: string[];
    /** Keys of edges to rectangles on right of `rect`. */
    right: string[];
    /** Keys of edges to rectangles beneath `rect`. */
    bottom: string[];
    /** Keys of edges to rectangles on left of `rect`. */
    left: string[];
  };
}

class ViewNode extends BaseNode<ViewNodeOpts> {}

interface ViewEdgeOpts extends BaseEdgeOpts<ViewNode> {
  /** Shared line segment between rects */
  portal: [Vector2, Vector2];
}

class ViewEdge extends BaseEdge<ViewNode, ViewEdgeOpts> {}

/**
 * Nodes are rectangles covering viewable space.
 * Edges are shared line segments.
 */
export class ViewGraph extends BaseGraph<
  ViewNode,
  ViewNodeOpts,
  ViewEdge,
  ViewEdgeOpts
> {

  /** Rectangles partitioning `polys`. */
  public rects: Rect2[];

  constructor(public polys: Poly2[]) {
    super(ViewEdge);
    this.rects = [];
  }

  /**
   * Npm module 'rectangle-decomposition' requires +ve coords,
   * so we transform first, then apply inverse transform.
   */
  private computeRects(polys: Poly2[]) {
    const bounds = Rect2.from(...polys.flatMap(({ bounds }) => bounds));
    const groupedLoops = polys
      .map(({ points, holes }) => [points].concat(holes))
      .map(loops => loops.map((loop) => loop.map(({ x, y }) =>
        [x - bounds.x, y - bounds.y] as [number, number])));
    const groupedRects = groupedLoops.map(loops => 
      rectDecompose(loops).map(([[x1, y1], [x2, y2]]) =>
        new Rect2(bounds.x + x1, bounds.y + y1, x2 - x1, y2 - y1)));
    this.rects = groupedRects.flatMap(rects => rects);
  }

  public static from(polys: Poly2[], metas: LevelMeta[]): ViewGraph {
    const graph = new ViewGraph(polys);
    graph.computeRects(polys);

    const rectToAdjs = new Map<Rect2, { top: Rect2[]; right: Rect2[]; bottom: Rect2[]; left: Rect2[] }>();
    graph.rects.forEach((rect) => {
      const adjRects = graph.rects.filter(other => other.intersects(rect) && other !== rect);
      rectToAdjs.set(rect, {
        top: adjRects.filter(other => other.bottom === rect.y),
        right: adjRects.filter(other => other.x === rect.right),
        bottom: adjRects.filter(other => other.y === rect.bottom),
        left: adjRects.filter(other => other.right === rect.x),
      });
    });

    graph.rects.forEach((rect) => {
      const adjs = rectToAdjs.get(rect)!;
      const id = `${rect}`;
      graph.registerNode(new ViewNode({
        id,
        rect,
        edgeKeys: mapValues(
          adjs, // Edge ids are set this way in BaseEdge
          rects => rects.map(({ key }) => `${id}->${key}`),
        ),
        metaKeys: metas
          .filter(({ rect: other }) => other?.intersects(rect))
          .map(({ key }) => key),
      }));
    });
    
    graph.rects.forEach((rect) => {
      const adjs = rectToAdjs.get(rect)!;
      const { x, right, y, bottom } = rect;

      adjs.top.map((other) => {
        graph.connect({ src: rect.key, dst: other.key, portal: [
          new Vector2(Math.max(x, other.x), rect.y),
          new Vector2(Math.min(right, other.right), rect.y),
        ]});
      });
      adjs.right.map((other) => {
        graph.connect({ src: rect.key, dst: other.key, portal: [
          new Vector2(rect.right, Math.max(y, other.y)),
          new Vector2(rect.right, Math.min(bottom, other.bottom)),
        ]});
      });
      adjs.bottom.map((other) => {
        graph.connect({ src: rect.key, dst: other.key, portal: [
          new Vector2(Math.max(x, other.x), rect.bottom),
          new Vector2(Math.min(right, other.right), rect.bottom),
        ]});
      });
      adjs.left.map((other) => {
        graph.connect({ src: rect.key, dst: other.key, portal: [
          new Vector2(rect.x, Math.max(y, other.y)),
          new Vector2(rect.x, Math.min(bottom, other.bottom)),
        ]});
      });
    });

    return graph;
  }

  /**
   * TODO test this...
   */
  public isVisibleFrom(
    /** Source rectangle's key */
    srcRectKey: string,
    /** Position in source rectangle */
    src: Vector2Json,
    /** Destination rectangle's key */
    dstRectKey: string,
    /** Position in destination rectangle */
    dst: Vector2Json,
  ): boolean {

    if (srcRectKey === dstRectKey) {
      return true;
    }
    const { edgeKeys, rect } = this.getNodeById(srcRectKey)!.opts;
    const [dx, dy] = [dst.x - src.x, dst.y - src.y];

    if (dst.x !== src.x) {
      const x = dst.x > src.x ? rect.right : rect.x;
      for (const edgeKey of dst.x > src.x ? edgeKeys.right : edgeKeys.left) {
        const { otherOpts: { portal }, dst: nextSrc } = this.getEdgeById(edgeKey)!;
        const y = (x - src.x) * (dy / dx);
        if (portal[0].y <= y && y <= portal[1].y) {
          return this.isVisibleFrom(nextSrc.id, { x, y }, dstRectKey, dst);
        }
      }
    }

    if (dst.y !== src.y) {
      const y = dst.y > src.y ? rect.bottom : rect.y;
      for (const edgeKey of dst.y > src.y ? edgeKeys.bottom : edgeKeys.top) {
        const { otherOpts: { portal }, dst: nextSrc } = this.getEdgeById(edgeKey)!;
        const x = (y - src.y) * (dx / dy);
        if (portal[0].x <= x && x <= portal[1].x) {
          return this.isVisibleFrom(nextSrc.id, { x, y }, dstRectKey, dst);
        }
      }
    }

    return false;
  }
}
