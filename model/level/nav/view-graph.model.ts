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
  private groupedRects: Rect2[][];

  constructor(public polys: Poly2[]) {
    super(ViewEdge);
    this.rects = [];
    this.groupedRects = [];
  }

  private storeRects(groupedRects: Rect2[][]) {
    this.groupedRects = groupedRects.slice();
    this.rects = this.groupedRects.flatMap(rects => rects);
  }

  public findRect(point: Vector2Json) {
    for (const [polyId, rects] of this.groupedRects.entries()) {
      const found = rects.find(rect => rect.contains(point));
      if (found) {
        return { polyId, rect: found };
      }
    }
    return null;
  }

  public static from(
    polys: Poly2[],
    metas: LevelMeta[],
    groupedRects: Rect2[][],
  ): ViewGraph {
    const graph = new ViewGraph(polys);
    graph.storeRects(groupedRects);

    const rectToAdjs = new Map<Rect2, {
      /** Rects which are above. */
      top: Rect2[];
      /** Rects which are on right. */
      right: Rect2[];
      /** Rects which are below. */
      bottom: Rect2[];
      /** Rects which on left. */
      left: Rect2[];
    }>();
    graph.rects.forEach((rect) => {
      const adjRects = graph.rects
        .filter(other => other.intersects(rect) && other !== rect);
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

  public isVisibleFrom(
    /** Source rectangle's key */
    srcKey: string,
    /** Position in source rectangle */
    src: Vector2Json,
    /** Destination rectangle's key */
    dstKey: string,
    /** Position in destination rectangle */
    dst: Vector2,
    /**
     * The rectangles we've seen so far:
     * - used to prevent cycles at corner points i.e. 0-dim portals.
     * - order of keys can be used to compute raycast.
     */
    seen: { [rectKey: string]: true } = {},
  ): boolean {
    // console.log({ srcKey, src, dstKey, dst, seen });

    seen[srcKey] = true;
    if (srcKey === dstKey) {
      return true;
    }
    const { edgeKeys, rect } = this.getNodeById(srcKey)!.opts;
    const [dx, dy] = [dst.x - src.x, dst.y - src.y];

    if (dst.x !== src.x) {
      const x = dst.x > src.x ? rect.right : rect.x;
      for (const edgeKey of dst.x > src.x ? edgeKeys.right : edgeKeys.left) {
        const { otherOpts: { portal }, dst: nextSrc } = this.getEdgeById(edgeKey)!;
        const y = src.y + ((x - src.x) * (dy / dx));
        if (portal[0].y <= y && y <= portal[1].y && !seen[nextSrc.id]) {
          return this.isVisibleFrom(nextSrc.id, { x, y }, dstKey, dst, seen);
        }
      }
    }

    if (dst.y !== src.y) {
      const y = dst.y > src.y ? rect.bottom : rect.y;
      for (const edgeKey of dst.y > src.y ? edgeKeys.bottom : edgeKeys.top) {
        const { otherOpts: { portal }, dst: nextSrc } = this.getEdgeById(edgeKey)!;
        const x = src.x + ((y - src.y) * (dx / dy));
        if (portal[0].x <= x && x <= portal[1].x && !seen[nextSrc.id]) {
          return this.isVisibleFrom(nextSrc.id, { x, y }, dstKey, dst, seen);
        }
      }
    }

    return false;
  }
}
