import rectDecompose from 'rectangle-decomposition';
import { Vector2 } from '@model/vec2.model';
import { Rect2 } from '@model/rect2.model';
import { Poly2 } from '@model/poly2.model';
import { BaseNodeOpts, BaseNode, BaseEdgeOpts, BaseEdge, BaseGraph } from '@model/graph.model';
import { LevelMeta } from '../level-meta.model';
import { mapValues } from '@model/generic.model';

interface ViewNodeOpts extends BaseNodeOpts {
  /** `${rect}` */
  id: string;
  rect: Rect2;
  /** Keys of metas which overlap `rect` */
  metaKeys: string[];
  /** Adjacent ids grouped by top, right, bottom, left */
  adjs: {
    top: string[];
    right: string[];
    bottom: string[];
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

  public static from(
    polys: Poly2[],
    metas: LevelMeta[],
  ): ViewGraph {
    const graph = new ViewGraph(polys);
    graph.computeRects(polys);

    // Build the graph
    graph.rects.forEach((rect) => {
      const adjRects = graph.rects.filter(other => other.intersects(rect));
      const adjs = {
        top: adjRects.filter(other => other.bottom === rect.y),
        right: adjRects.filter(other => other.x === rect.right),
        bottom: adjRects.filter(other => other.y === rect.bottom),
        left: adjRects.filter(other => other.right === rect.x),
      };

      graph.registerNode(new ViewNode({
        id: `${rect}`,
        rect,
        adjs: mapValues(adjs, rects => rects.map(({ key }) => key)),
        metaKeys: metas
          .filter(({ rect: other }) => other?.intersects(rect))
          .map(({ key }) => key),
      }));

      const { x, right, y, bottom } = rect;

      adjs.top.map((other) => {
        graph.connect({ src: rect.key, dst: rect.key, portal: [
          new Vector2(Math.max(x, other.x), rect.y),
          new Vector2(Math.min(right, other.right), rect.y),
        ]});
      });
      adjs.right.map((other) => {
        graph.connect({ src: rect.key, dst: rect.key, portal: [
          new Vector2(rect.right, Math.max(y, other.y)),
          new Vector2(rect.right, Math.min(bottom, other.bottom)),
        ]});
      });
      adjs.bottom.map((other) => {
        graph.connect({ src: rect.key, dst: rect.key, portal: [
          new Vector2(Math.max(x, other.x), rect.bottom),
          new Vector2(Math.min(right, other.right), rect.bottom),
        ]});
      });
      adjs.left.map((other) => {
        graph.connect({ src: rect.key, dst: rect.key, portal: [
          new Vector2(rect.x, Math.max(y, other.y)),
          new Vector2(rect.x, Math.min(bottom, other.bottom)),
        ]});
      });
    });

    return graph;
  }
}
