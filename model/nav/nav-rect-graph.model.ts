import rectDecompose from 'rectangle-decomposition';
import { BaseNodeOpts, BaseNode, BaseEdgeOpts, BaseEdge, BaseGraph } from '@model/graph.model';
import { Rect2Json, Rect2 } from '@model/rect2.model';
import { Poly2 } from '@model/poly2.model';
import { Vector2 } from '@model/vec2.model';

interface NavRectNodeOpts extends BaseNodeOpts {
  /** `${Rect2.from(rect)}` */
  id: string;
  rect: Rect2Json;
}

class NavRectNode extends BaseNode<NavRectNodeOpts> {} 

interface NavRectEdgeOpts extends BaseEdgeOpts<NavRectNode> {
  neighbourKeys: string[];
}

class NavRectEdge extends BaseEdge<NavRectNode, NavRectEdgeOpts> {}

export class NavRectGraph extends BaseGraph<NavRectNode, NavRectNodeOpts, NavRectEdge, NavRectEdgeOpts> {
  
  /** Rectangles partitioning `polys`. */
  public rects: Rect2[];

  constructor(
    /** Rectilinear polygons */
    public polys: Poly2[],
  ) {
    super(NavRectEdge);
    this.rects = [];
  }

  public computeRects() {
    /**
     * Npm module 'rectangle-decomposition' requires +ve coords,
     * so we transform first, then apply inverse transform.
     */
    const bounds = Rect2.from(...this.polys.flatMap(({ bounds }) => bounds));
    const loops = this.polys
      .flatMap(({ points, holes }) => [points].concat(holes))
      .map((loop) => loop.map(({ x, y }) =>
        [x - bounds.x, y - bounds.y] as [number, number]));

    this.rects = rectDecompose(loops).map(([[x1, y1], [x2, y2]]) =>
      new Rect2(bounds.x + x1, bounds.y + y1, x2 - x1, y2 - y1));
  }

  public static from(navFloors: Poly2[]): NavRectGraph {
    const graph = new NavRectGraph(navFloors);
    graph.computeRects();
    return graph;
  }
  
}