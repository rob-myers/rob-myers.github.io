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
  private groupRectsPoints: Vector2[][];
  private groupedSteiners: Vector2[][];
  /** Rectangle to NavNodes on its border (includes own corners). */
  private rectToNavNodes: Map<Rect2, {
    polyId: number;
    nodes: NavNode[];
    /** Number of nodes on left/right side. */
    lrCount: number;
    /** Number of nodes on top/bottom side. */
    tbCount: number;
  }>;
  /** Node to position lookup. */
  public nodeToPosition: Map<NavNode, Vector2>;
  /**
   * Node to a rectangle containing it.
   * Can be multiple rects containing a node via shared corners.
   */
  public nodeToRect: Map<NavNode, Rect2>;

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
    this.groupRectsPoints = [];
    this.groupedSteiners = [];
    this.nodeToPosition = new Map;
    this.rectToNavNodes = new Map;
    this.tempPoint = Vector2.zero;
    this.nodeToRect = new Map;
  }

  /** Returns rects partitioning navPolys, grouped by polygon id. */
  public computeRects(navPolys: Poly2[]) {
    /**
     * Npm module 'rectangle-decomposition' requires +ve coords,
     * so we transform first, then apply inverse transform.
     */
    const bounds = Rect2.from(...navPolys.flatMap(({ bounds }) => bounds));
    const groupedLoops = navPolys
      .map(({ points, holes }) => [points].concat(holes))
      .map(loops => loops.map((loop) => loop.map(({ x, y }) =>
        [x - bounds.x, y - bounds.y] as [number, number])));
    this.groupedRects = groupedLoops.map(loops => 
      rectDecompose(loops).map(([[x1, y1], [x2, y2]]) =>
        new Rect2(bounds.x + x1, bounds.y + y1, x2 - x1, y2 - y1)));
    this.groupRectsPoints = this.groupedRects
      .map(rects => rects.flatMap(rect => rect.poly2.points)
        .filter((p, i, array) => array.findIndex(q => p.equals(q)) === i));
    this.rects = this.groupedRects.flatMap(rects => rects);
  }

  private computeNodeToPosition() {
    this.nodesArray.forEach((node) => {
      const { polyId, vertexId } = node.opts;
      const position = this.navPolys[polyId].allPoints[vertexId];
      this.nodeToPosition.set(node, position);
      this.nodeToRect.set(node, this.rects.find(r => r.contains(position))!);
    });
  }

  private computeRectsNavNodes() {
    this.groupedRects.forEach((rects, polyId) => {
      rects.forEach((rect) => {
        const points = this.groupRectsPoints[polyId].filter(p => rect.contains(p));
        const [lrCount, tbCount] = points.reduce((agg, p) => [
          agg[0] + p.x === rect.x || p.x === rect.right ? 1 : 0,
          agg[1] + p.y === rect.y || p.y === rect.bottom ? 1 : 0,
        ], [0, 0] as [number, number]);
        const nodes = points.map(p => this.positionToNode(polyId, p)!);
        this.rectToNavNodes.set(rect, { polyId, nodes, lrCount, tbCount });
      });
    });
  }

  private computeRectsSteiners(metaSteiners: { [polyId: number]: Vector2[] }) {
    this.groupedSteiners = this.groupedRects.map((rects, polyId) => {
      // Points already in polygon, where steiners should've been removed
      const polyPoints = this.navPolys[polyId].allPoints
        .reduce<Record<string, Vector2>>((agg, p) => ({ ...agg, [`${p}`]: p }), {});
      
      // Steiners collected so far
      const steiners = (metaSteiners[polyId] || [])
        .reduce<Record<string, Vector2>>((agg, p) => ({ ...agg, [`${p}`]: p }), {});
      const addSteiner = (p: Vector2) => steiners[`${p}`] = p;

      rects.forEach((rect) => {
        this.groupRectsPoints[polyId]
          .filter(p => rect.contains(p))
          .forEach(p => {
            !polyPoints[`${p}`] && addSteiner(p);
            // if (p.y === rect.y && rect.x < p.x && p.x < rect.right) {
            //   addSteiner(new Vector2(p.x, rect.bottom));
            // } else if (p.x === rect.right && rect.y < p.y && p.y < rect.bottom) {
            //   addSteiner(new Vector2(rect.x, p.y));
            // } else if (p.y === rect.bottom && rect.x < p.x && p.x < rect.right) {
            //   addSteiner(new Vector2(p.x, rect.y));
            // } else if (p.x === rect.x && rect.y < p.y && p.y < rect.bottom) {
            //   addSteiner(new Vector2(rect.right, p.y));
            // }
          });
      });
      return Object.values(steiners);
    });
  }

  /**
   * TODO should already know rect of actor
   * Get 4 closest points on the rectangle containing `point`.
   */
  public findNearbyPoints(point: Vector2) {
    const rect = this.rects.find(r => r.contains(point));
    if (rect) {
      const { nodes, polyId, lrCount, tbCount } = this.rectToNavNodes.get(rect)!;
      const ps = nodes.map(node => this.nodeToPosition.get(node)!);
      const { topLeft, topRight, bottomRight, bottomLeft } = rect;

      if (ps.length > 4) {
        if (lrCount > tbCount) { // More points on left/right
          ps.forEach(p => {
            if (p.x === topLeft.x) {
              topLeft.y <= p.y && p.y <= point.y && topLeft.copy(p)
                || p.y <= bottomLeft.y && point.y <= p.y && bottomLeft.copy(p);
            } else if (p.x === topRight.x) {
              topRight.y <= p.y && p.y <= point.y && topRight.copy(p)
                || p.y <= bottomRight.y && point.y <= p.y && bottomRight.copy(p);
            }
          });
        } else { // More points on bottom/top
          ps.forEach(p => {
            if (p.y === topLeft.y) {
              topLeft.x <= p.x && p.x <= point.x && topLeft.copy(p)
                || p.x <= topRight.x && point.x <= p.x && topRight.copy(p);
            } else if (p.y === bottomLeft.y) {
              bottomLeft.x <= p.x && p.x <= point.x && bottomLeft.copy(p)
                || p.x <= bottomRight.x && point.x <= p.x && bottomRight.copy(p);
            }
          });
        }
      }

      return { polyId,
        choices: [topLeft, topRight, bottomRight, bottomLeft]
          .map(point => ({ point, node: this.positionToNode(polyId, point)! }))
          .map(({ node, point: other }) => ({
            nodeId: node.id,
            dist: this.tempPoint.copy(point).sub(other).length,
          })),
      };
    }
    return null;
  }

  /**
   * Construct NavGraph from navmesh `navPolys`.
   */
  public static from(
    navPolys: Poly2[],
    metaSteiners: { [polyId: number]: Vector2[] },
  ): NavGraph {
    const groupedTris = navPolys.map(p => p.triangulation);
    const graph = new NavGraph(navPolys, groupedTris);
    graph.computeRects(navPolys); // Compute rect partition

    navPolys.forEach((poly) => poly.removeSteiners());
    graph.computeRectsSteiners(metaSteiners);

    navPolys.forEach((poly, polyId) => {
      poly.addSteiners(graph.groupedSteiners[polyId]);
      /**
       * Only custom triangulate supports steiners.
       * Also use temporary tiny outset to permit steiners on edges.
       */
      poly.customTriangulate(0.01);
    });

    let globalId = 0;
    // `triangleIds` refer to points, holes and steiners of polygon
    for (const [polyId, { allPoints, triangleIds }] of navPolys.entries()) {
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

    graph.computeRectsNavNodes();
    graph.computeNodeToPosition();
    return graph;
  }

  private positionToNode(polyId: number, point: Vector2) {
    const vertexId = this.navPolys[polyId].allPoints.findIndex(p => p.equals(point));
    if (vertexId >= 0) {
      return this.getNodeById(`${polyId}-${vertexId}`) || null;
    }
    return null;
  }

}
