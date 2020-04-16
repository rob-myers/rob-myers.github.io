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

  public storeRects(groupedRects: Rect2[][]) {
    this.groupedRects = groupedRects;
    this.groupRectsPoints = this.groupedRects
      .map(rects => rects.flatMap(rect => rect.poly2.points)
        .filter((p, i, array) => array.findIndex(q => p.equals(q)) === i));
    this.rects = groupedRects.flatMap(x => x);
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
        const nodes = points.map(p => this.positionToNode(polyId, p)!);
        this.rectToNavNodes.set(rect, { polyId, nodes });
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
        this.groupRectsPoints[polyId].filter(p => rect.contains(p))
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
   * TODO should already know rect of actor.
   * Find all points of NavNodes on border of rect.
   * Restricting to 'close points' might not work, so we'll
   * avoid there being too many via level design.
   */
  public findNearbyPoints(point: Vector2) {
    const rect = this.rects.find(r => r.contains(point));
    if (rect) {
      const { nodes, polyId } = this.rectToNavNodes.get(rect)!;
      return { polyId,
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
  public static from(
    navPolys: Poly2[],
    metaSteiners: { [polyId: number]: Vector2[] },
    groupedRects: Rect2[][],
  ): NavGraph {
    const groupedTris = navPolys.map(p => p.triangulation);
    const graph = new NavGraph(navPolys, groupedTris);
    graph.storeRects(groupedRects);

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
