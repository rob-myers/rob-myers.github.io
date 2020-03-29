import rectDecompose from 'rectangle-decomposition';
import { BaseNodeOpts, BaseNode, BaseEdgeOpts, BaseEdge, BaseGraph } from '@model/graph.model';
import { Rect2 } from '@model/rect2.model';
import { Poly2 } from '@model/poly2.model';
import { removeDups } from '@model/generic.model';
import { Vector2 } from '@model/vec2.model';

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
  
  /** Rectangles partitioning `polys`. */
  public rects: Rect2[];
  /** Rect to points on border. */
  private rectToPoints: Map<Rect2, { polyId: number; nodes: NavNode[]; positions: Vector2[] }>;
  /** Node to position lookup. */
  private nodeToPosition: Map<NavNode, Vector2>;
  /** Rects this node belongs to. */
  private nodeToRects: Map<NavNode, Rect2[]>;
  /** Pointwise rectilinear inverses formed by cutting from bounds. */
  private invertedNavPolys: Poly2[][];
  private tempPoint: Vector2;

  constructor(
    /** Navigable rectilinear polygons */
    public navPolys: Poly2[],
    /** Grouped triangulations */
    public groupedTris: Poly2[][],
  ) {
    super(NavEdge);
    this.rects = [];
    this.nodeToRects = new Map;
    this.nodeToPosition = new Map;
    this.invertedNavPolys = [];
    this.rectToPoints = new Map;
    this.tempPoint = Vector2.zero;
  }

  /**
   * Returns array aligned to navPolys, where each entry
   * is a list of rectangles partitioning respective poly.
   */
  public static computeRects(navPolys: Poly2[]) {
    // Npm module 'rectangle-decomposition' requires +ve coords,
    // so we transform first, then apply inverse transform.
    const bounds = Rect2.from(...navPolys.flatMap(({ bounds }) => bounds));
    const groupedLoops = navPolys
      .map(({ points, holes }) => [points].concat(holes))
      .map(loops => loops.map((loop) => loop.map(({ x, y }) =>
        [x - bounds.x, y - bounds.y] as [number, number])));
        
    const groupedRects = groupedLoops.map(loops => 
      rectDecompose(loops).map(([[x1, y1], [x2, y2]]) =>
        new Rect2(bounds.x + x1, bounds.y + y1, x2 - x1, y2 - y1)));

    return groupedRects;
  }

  /** For each rect, collect points of all rects which lie on its border. */
  private computeRectsPoints(groupedRects: Rect2[][]) {
    // All points occuring on rectangles without dups, grouped by polyId
    const groupedPoints = groupedRects
      .map(rects => rects.flatMap(rect => rect.poly2.points)
        .filter((p, i, array) => array.findIndex(q => p.equals(q)) === i));

    for (const [polyId, rects] of groupedRects.entries()) {
      for (const rect of rects) {
        const positions = groupedPoints[polyId].filter(p => rect.contains(p));
        // Assume every point on a rectangle occurs as a NavNode
        const nodes = positions.map(p => this.positionToNode(polyId, p)!);
        this.rectToPoints.set(rect, { polyId, nodes, positions });
      }
    }
  }

  public findNearbyPoints(point: Vector2) {
    const rect = this.rects.find(r => r.contains(point));
    if (rect) {
      const { nodes, polyId, positions } = this.rectToPoints.get(rect)!;
      return {
        polyId,
        choices: nodes.map((node, i) => ({
          nodeId: node.id,
          dist: this.tempPoint.copy(point).sub(positions[i]).length,
        })),
      };
    }
    return null;
  }

  /**
   * Construct NavGraph from navmesh `navPolys`.
   */
  public static from(navPolys: Poly2[]): NavGraph {
    const groupedTris = navPolys.map(p => p.triangulation);
    const graph = new NavGraph(navPolys, groupedTris);
    let globalId = 0;

    /**
     * `triangleIds` refer to points, holes and steiners of polygon.
     */
    for (const [polyId, { allPoints, triangleIds }] of navPolys.entries()) {
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

    // Compute inverse for line-of-sight tests
    graph.invertedNavPolys = navPolys.map(poly =>
      Poly2.cutOut([poly], [poly.bounds.poly2]));

    // Compute rectangular partition (as opposed to triangular one)
    const groupedRects = NavGraph.computeRects(navPolys);
    graph.rects = groupedRects.flatMap(rects => rects);
    graph.computeRectsPoints(groupedRects);

    // Build lookups
    graph.nodesArray.forEach((node) => {
      const { polyId, vertexId } = node.opts;
      const position = graph.navPolys[polyId].allPoints[vertexId];
      graph.nodeToPosition.set(node, position);
      // const rects = graph.rects.filter(r => r.contains(position));
      // graph.nodeToRects.set(node, rects);
    });

    return graph;
  }
  
  /**
   * TODO properly
   * i.e. detect if line segment intersects this.invertedNavPolys
   */
  public isVisibleFrom(src: NavNode, dst: NavNode) {
    const srcRects = this.nodeToRects.get(src) || [];
    const dstRects = this.nodeToRects.get(dst) || [];
    return srcRects.some(r => dstRects.includes(r)) ;
  }

  private positionToNode(poly2: number, point: Vector2) {
    const vertexId = this.navPolys[poly2].allPoints.findIndex(p => p.equals(point));
    if (vertexId >= 0) {
      return this.getNodeById(`${poly2}-${vertexId}`) || null;
    }
    return null;
  }

}
