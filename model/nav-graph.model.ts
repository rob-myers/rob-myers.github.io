import { Poly2 } from './poly2.model';
import { BaseGraph, BaseNode, BaseNodeOpts, BaseEdge, BaseEdgeOpts } from './graph.model';

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

  public get json(): NavGraphJson {
    return {
      nodes: this.nodesArray.map(({ origOpts }) => origOpts),
      edges: this.edgesArray.map(({ src, dst, otherOpts: { portal } }) => ({
        src: src.id,
        dst: dst.id,
        portal,
      })),
    };
  }

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

interface NavGraphJson {
  nodes: NavNodeOpts[];
  edges: NavEdgeJson[];
}

interface NavEdgeJson {
  src: string;
  dst: string;
  portal: [number, number];
}
