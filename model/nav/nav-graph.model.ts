import { Poly2 } from '../poly2.model';
import { BaseGraph, BaseNode, BaseNodeOpts, BaseEdge, BaseEdgeOpts } from '../graph.model';
import { Vector2 } from '../vec2.model';

interface NavNodeOpts extends BaseNodeOpts {
  /** Index of polygon this node occurs in */
  polyId: number;
  /** Index of triangle in triangulation of polygon */
  triId: number;
  /** Indices of points in polygon defining the triangle */
  pointIds: [number, number, number];
}

/** Represents a triangle in navmesh */
class NavNode extends BaseNode<NavNodeOpts> {}

interface NavEdgeOpts extends BaseEdgeOpts<NavNode> {
  /** Point ids shared by src/dst */
  portal: [number, number];
}

/** Represents a portal in navmesh */
class NavEdge extends BaseEdge<NavNode, NavEdgeOpts> {}


export class NavGraph extends BaseGraph<
  NavNode, NavNodeOpts, NavEdge, NavEdgeOpts
> {

  /** Needs original polygons as input */
  public dualGraph(polys: Poly2[]) {
    const polyPs = polys.map(({ allPoints }) => allPoints);
    const toCenter = this.nodesArray.reduce(
      (agg, { id, opts: { polyId, pointIds } }) => ({
        ...agg,
        [id]: Poly2.centerOf(pointIds.map(id => polyPs[polyId][id])),
      }),
      {} as Record<string, Vector2>,
    );
    const segs = this.edgesArray.map(({ src, dst }) => [
      toCenter[src.id], toCenter[dst.id]
    ] as [Vector2, Vector2]);
    return { centers: Object.values(toCenter), segs };
  }

  public get json(): NavGraphJson {
    return {
      nodes: this.nodesArray.map(({ opts: origOpts }) => origOpts),
      edges: this.edgesArray.map(({ src, dst, otherOpts: { portal } }) => ({
        src: src.id,
        dst: dst.id,
        portal,
      })),
    };
  }

  /**
   * Compute from a triangulation.
   */
  public static from(polys: Poly2[]): NavGraph {
    const graph = new NavGraph(NavEdge);

    for (const [polyId, { triangleIds }] of polys.entries()) {
      triangleIds.forEach((pointIds, triId) => {
        const node = new NavNode({
          id: `${polyId}-${triId}`,
          polyId,
          triId,
          pointIds,
        });
        graph.registerNode(node);
      });

      // adjs[{pidA}_{pidB}] is one or two triangle indexes
      const adjs = triangleIds.reduce(
        (agg, triple, triIndex) => {
          triple.forEach((pidA, i) => {
            const pidB = triple[(i + 1) % 3];
            const key = pidA < pidB ? `${pidA}_${pidB}` : `${pidB}_${pidA}`;
            (agg[key] = agg[key] || []).push(triIndex);
          });
          return agg;
        },
        {} as Record<string, number[]>
      );

      triangleIds.forEach((triple, triIndex) => {
        triple.forEach((pidA, i) => {
          const pidB = triple[(i + 1) % 3];
          // Find at most one other triangle
          const key = pidA < pidB ? `${pidA}_${pidB}` : `${pidB}_${pidA}`;
          const adjIds = adjs[key].filter(k => k !== triIndex);
          adjIds.forEach((otherIndex) => {
            graph.connect({
              src: `${polyId}-${triIndex}`,
              dst: `${polyId}-${otherIndex}`,
              portal: [pidA, pidB],
            });
          });
        });
      });
    }
    return graph;
  }

  public static fromJson({ nodes, edges }: NavGraphJson): NavGraph {
    const graph = new NavGraph(NavEdge);
    nodes.forEach((nodeOpts) => graph.registerNode(new NavNode(nodeOpts)));
    edges.forEach(edgeOpts => graph.connect(edgeOpts));
    return graph;
  }

}

export interface NavGraphJson {
  nodes: NavNodeOpts[];
  edges: NavEdgeJson[];
}

interface NavEdgeJson {
  src: string;
  dst: string;
  portal: [number, number];
}

/**
 * Floyd Warshall algorithm
 * https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/graph/floyd-warshall/floydWarshall.js
 */
export class FloydWarshall {
  
  constructor(
    public dist: { [srcId: string]: { [targetId: string]: number  } } = {},
    public next: { [srcId: string]: { [targetId: string]: null | string  } } = {},
  ) {}

  public static from(graph: NavGraph): FloydWarshall {
    const fm = new FloydWarshall();
    fm.initializeFrom(graph);
    const [vs, dist, next] = [graph.nodesArray, fm.dist, fm.next];

    vs.forEach(({ id: middleId }) => {
      vs.forEach(({ id: startId }) => {
        vs.forEach(({ id: endId }) => {
          const altDist = dist[startId][middleId] + dist[middleId][endId];

          if (dist[startId][endId] > altDist) {
            dist[startId][endId] = altDist;
            next[startId][endId] = middleId;
          }
        });
      });
    });

    return fm;
  }

  private initializeFrom(navGraph: NavGraph) {
    // Distances initially infinite
    const { nodesArray: vs } = navGraph;
    const innerDist = vs.reduce((agg, { id }) => ({ ...agg,
      [id]: Number.POSITIVE_INFINITY }), {} as Record<string, number>);
    this.dist = vs.reduce((agg, v) => ({ ...agg, [v.id]: { ...innerDist } }), {});
    // Next vertices initially null
    const innerNext = vs.reduce((agg, { id }) => ({ ...agg, [id]: null }),
      {} as Record<string, null | string>);
    this.next = vs.reduce((agg, v) => ({ ...agg, [v.id]: { ...innerNext } }), {});

    vs.forEach((vA) =>
      vs.forEach((vB) => {
        if (vA === vB) {
          this.dist[vA.id][vB.id] = 0;
        } else if (navGraph.isConnected(vA, vB)) {
          this.dist[vA.id][vB.id] = 1;
          this.next[vA.id][vB.id] = vA.id; // ?
        }
      })
    );
  }
}
