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
  /** Global index in `polys.flatMap(({ allPoints }) => allPoints) */
  globalId: number;
  // /** Indices of neighbouring triangles in triangulation of polygon. */
  // triIds: number[];
}

export class NavNode extends BaseNode<NavNodeOpts> {} 

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
    public navPolys: Poly2[],
    /** Grouped triangulations */
    public groupedTris: Poly2[][],
  ) {
    super(NavEdge);
    this.rects = [];
  }

  /**
   * Returns array aligned to navPolys, where each entry
   * is a list of rectangles partitioning respective poly.
   */
  public static computeRects(navPolys: Poly2[]) {
    /**
     * Npm module 'rectangle-decomposition' requires +ve coords,
     * so we transform first, then apply inverse transform.
     */
    const bounds = Rect2.from(...navPolys.flatMap(({ bounds }) => bounds));
    const groupedLoops = navPolys
      .map(({ points, holes }) => [points].concat(holes))
      .map(loops => loops.map((loop) => loop.map(({ x, y }) =>
        [x - bounds.x, y - bounds.y] as [number, number])));
        
    return groupedLoops.map(loops => 
      rectDecompose(loops).map(([[x1, y1], [x2, y2]]) =>
        new Rect2(bounds.x + x1, bounds.y + y1, x2 - x1, y2 - y1)));
  }

  /**
   * Construct NavGraph from navmesh `navFloors`.
   */
  public static from(navFloors: Poly2[]): NavGraph {
    const groupedTris = navFloors.map(p => p.triangulation);
    const graph = new NavGraph(navFloors, groupedTris);
    let globalId = 0;

    /**
     * `triangleIds` refer to points, holes and steiners of polygon.
     */
    for (const [polyId, { allPoints, triangleIds }] of navFloors.entries()) {
      // Create nodes
      for (const [vertexId] of allPoints.entries()) {
        graph.registerNode(new NavNode({
          id: `${polyId}-${vertexId}`,
          polyId,
          vertexId,
          adjacentIds: removeDups(triangleIds.flatMap(ids =>
            ids.includes(vertexId) ? ids.filter(id => id !== vertexId) : []
          )),
          globalId: globalId + vertexId,
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
      globalId += allPoints.length;
    }

    graph.rects = NavGraph.computeRects(navFloors).flatMap(rects => rects);
    return graph;
  }
  
}
