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
}

export class NavNode extends BaseNode<NavNodeOpts> {} 

type NavEdgeOpts = BaseEdgeOpts<NavNode>;

class NavEdge extends BaseEdge<NavNode, NavEdgeOpts> {}

export class NavGraph extends BaseGraph<NavNode, NavNodeOpts, NavEdge, NavEdgeOpts> {
  
  /** Rectangles partitioning `polys`. */
  public rects: Rect2[];
  /** Rectangles grouped by polygon id. */
  public groupedRects: Rect2[][];
  /** The respective corner points of `this.groupedRects`. */
  public groupedRectsPoints: Vector2[][];
  /**
   * `rect` to corners of all rects on border of `rect`.
   * Each has a corresponding NavNode, which'll be 2nd/penultimate in NavPath.
   */
  private rectToNavPoints: Map<Rect2, { polyId: number; nodes: NavNode[] }>;
  /**
   * Rect to corners of rects on border and their 'mirror points'.
   * These will be used as steiner points.
   */
  private rectToSteiners: Map<Rect2, { polyId: number; positions: Vector2[] }>;
  
  /** Node to position lookup. */
  private nodeToPosition: Map<NavNode, Vector2>;
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
    this.groupedRects = [];
    this.groupedRectsPoints = [];
    this.nodeToPosition = new Map;
    this.invertedNavPolys = [];
    this.rectToNavPoints = new Map;
    this.tempPoint = Vector2.zero;
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

    const groupedRects = groupedLoops.map(loops => 
      rectDecompose(loops).map(([[x1, y1], [x2, y2]]) =>
        new Rect2(bounds.x + x1, bounds.y + y1, x2 - x1, y2 - y1)));

    return groupedRects;
  }

  private computeRectsNavPoints() {
    this.groupedRects.forEach((rects, polyId) => {
      rects.forEach((rect) => {
        const positions = this.groupedRectsPoints[polyId].filter(p => rect.contains(p));
        // Each corner of a rect occurs as a NavNode (see `updateNavGraph`)
        const nodes = positions.map(p => this.positionToNode(polyId, p)!);
        this.rectToNavPoints.set(rect, { polyId, nodes });
      });
    });
  }

  private computeRectsSteiners() {
    // TODO
  }

  /** Get points on rectangle containing `point`. */
  public findNearbyPoints(point: Vector2) {
    const rect = this.rects.find(r => r.contains(point));
    if (rect) {
      const { nodes, polyId } = this.rectToNavPoints.get(rect)!;
      return {
        polyId,
        choices: nodes.map((node) => ({
          nodeId: node.id,
          dist: this.tempPoint.copy(point).sub(this.nodeToPosition.get(node)!).length,
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
    
    // `triangleIds` refer to points, holes and steiners of polygon
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
    graph.groupedRects = NavGraph.computeRects(navPolys);
    graph.rects = graph.groupedRects.flatMap(rects => rects);
    graph.groupedRectsPoints = graph.groupedRects
      .map(rects => rects.flatMap(rect => rect.poly2.points)
        .filter((p, i, array) => array.findIndex(q => p.equals(q)) === i));

    graph.computeRectsNavPoints();

    graph.nodesArray.forEach((node) => {
      const { polyId, vertexId } = node.opts;
      const position = graph.navPolys[polyId].allPoints[vertexId];
      graph.nodeToPosition.set(node, position);
    });

    return graph;
  }
  
  /**
   * TODO detect if line segment intersects this.invertedNavPolys
   */
  public isVisibleFrom(_src: NavNode, _dst: NavNode) {
    return false;
  }

  private positionToNode(polyId: number, point: Vector2) {
    const vertexId = this.navPolys[polyId].allPoints.findIndex(p => p.equals(point));
    if (vertexId >= 0) {
      return this.getNodeById(`${polyId}-${vertexId}`) || null;
    }
    return null;
  }

}
