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
  /** Key of a rectangle containing NavNode */
  rectKey: string;
  position: Vector2;
}

export class NavNode extends BaseNode<NavNodeOpts> {} 

type NavEdgeOpts = BaseEdgeOpts<NavNode>;

class NavEdge extends BaseEdge<NavNode, NavEdgeOpts> {}

export class NavGraph extends BaseGraph<NavNode, NavNodeOpts, NavEdge, NavEdgeOpts> {
  
  /** Rectangle partitions grouped by polygon id. */
  public groupedRects: Rect2[][];
  /**
   * Points occurring on some rectangle in partition of polygon.
   * There may be extra points not occuring on the polygon.
   * We ensure there are no duplicate points.
   */
  private groupRectsPoints: Vector2[][];
  /** Rectangles partitioning all navigable polygons. */
  public rects: Rect2[];
  private groupedSteiners: Vector2[][];
  /** Rectangle key to 'close NavNodes'. */
  private rectToNavNodes: Map<string, { polyId: number; nodes: NavNode[] }>;

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
    this.rectToNavNodes = new Map;
  }

  public storeRects(groupedRects: Rect2[][]) {
    this.groupedRects = groupedRects;
    this.groupRectsPoints = this.groupedRects
      .map(rects => rects.flatMap(rect => rect.poly2.points)
        .filter((p, i, array) => array.findIndex(q => p.equals(q)) === i));
    this.rects = groupedRects.flatMap(x => x);
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
   * Each rectangle has associated NavNodes:
   * - those on its border and also another rect's border.
   * - those steiners contained in the rectangle.
   */
  private computeRectToNavNodes() {
    this.groupedRects.forEach((rects, polyId) => {
      const [toRects, toPoints] = [new Map<Vector2, Rect2[]>(), new Map<Rect2, Vector2[]>()];
      this.groupRectsPoints[polyId].forEach(p => {
        const rs = rects.filter(r => r.contains(p));
        toRects.set(p, rs);
        rs.forEach(r => toPoints.set(r, (toPoints.get(r) || []).concat(p)));
      });
      rects.forEach((rect) => {
        const points = toPoints.get(rect)!.filter(p => toRects.get(p)!.length > 1);
        const steiners = this.groupedSteiners[polyId].filter(p =>
          rect.contains(p) && !points.some(q => q.equals(p)));
        const nodes = points.concat(steiners).map(p => this.positionToNode(p)!);
        this.rectToNavNodes.set(rect.key, { polyId, nodes });
      });
    });
  }

  /**
   * Find all points of NavNodes on border of rect.
   * Restricting to 'close points' might not work.
   */
  public findNearbyPoints(rectKey: string) {
    const { nodes, polyId } = this.rectToNavNodes.get(rectKey)!;
    return { polyId,
      choices: nodes.map((node) => ({
        nodeId: node.id,
        point: node.opts.position,
      })),
    };
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
      for (const [vertexId, position] of allPoints.entries()) {
        graph.registerNode(new NavNode({
          id: `${polyId}-${vertexId}`,
          polyId,
          vertexId,
          adjacentIds: removeDups(triangleIds.flatMap(ids =>
            ids.includes(vertexId) ? ids.filter(id => id !== vertexId) : []
          )),
          globalId: globalId + vertexId,
          rectKey: graph.groupedRects[polyId].find(x => x.contains(position))!.key,
          position: position.clone(),
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

    graph.computeRectToNavNodes();
    return graph;
  }

  private positionToNode(point: Vector2) {
    return this.nodesArray.find(node => node.opts.position.equals(point)) || null;
  }

}
