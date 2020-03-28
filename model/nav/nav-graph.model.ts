import rectDecompose from 'rectangle-decomposition';
import { BaseNodeOpts, BaseNode, BaseEdgeOpts, BaseEdge, BaseGraph } from '@model/graph.model';
import { Rect2 } from '@model/rect2.model';
import { Poly2 } from '@model/poly2.model';
import { removeDups } from '@model/generic.model';

interface NavNodeOpts extends BaseNodeOpts {
  /** `${polyId}-${vertexId}` */
  id: string;
  /** Index of polygon this node occurs in. */
  polyId: number;
  /** Vertex of polygon this node corresponds to. */
  vertexId: number;
  /** Indices of neighbouring vertices in triangulation of polygon. */
  adjacentIds: number[];
  // /** Indices of neighbouring triangles in triangulation of polygon. */
  // triIds: number[];
}

class NavNode extends BaseNode<NavNodeOpts> {} 

type NavEdgeOpts = BaseEdgeOpts<NavNode>;

class NavEdge extends BaseEdge<NavNode, NavEdgeOpts> {}

export class NavGraph extends BaseGraph<NavNode, NavNodeOpts, NavEdge, NavEdgeOpts> {
  /**
   * Rectangles partitioning `polys`.
   * These play an auxiliary role.
   */
  public rects: Rect2[];

  constructor(
    /** Navigable rectilinear polygons */
    private polys: Poly2[],
    /** Aligned triangulations */
    private polysTris: Poly2[][],
  ) {
    super(NavEdge);
    this.rects = [];
  }

  private computeRects() {
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

  /**
   * Construct NavGraph from navmesh `navFloors`.
   */
  public static from(navFloors: Poly2[]): NavGraph {
    const groupedTris = navFloors.map(p => p.triangulation);
    const graph = new NavGraph(navFloors, groupedTris);

    for (const [polyId, { points, triangleIds }] of navFloors.entries()) {
      // Create nodes
      for (const [vertexId] of points.entries()) {
        graph.registerNode(new NavNode({
          id: `${polyId}-${vertexId}`,
          polyId,
          vertexId,
          adjacentIds: removeDups(triangleIds.flatMap(ids =>
            ids.includes(vertexId) ? ids.filter(id => id !== vertexId) : []
          ))
        }));
      }
      // Create edges
      for (const node of graph.nodesArray) {
        const { polyId, adjacentIds } = node.opts;
        for (const adjId of adjacentIds) {
          graph.connect({
            src: node,
            dst: graph.getNodeById(`${polyId}-${adjId}`)!,
          });
        }
      }
    }

    graph.computeRects();
    return graph;
  }
  
}
