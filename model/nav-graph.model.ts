import { Poly2 } from './poly2.model';
import { BaseGraph, BaseNode, BaseNodeOpts, BaseEdge, BaseEdgeOpts } from './graph.model';

/** Represents a triangle in navmesh. */
class NavNode extends BaseNode<NavNodeOpts> {
  constructor(opts: NavNodeOpts) {
    super(opts);
  }
}

interface NavNodeOpts extends BaseNodeOpts {
  triIds: [number, number, number];
}

/** Represents a portal in navmesh */
class NavEdge extends BaseEdge<NavNode, NavEdgeOpts> {}

interface NavEdgeOpts extends BaseEdgeOpts<NavNode> {
  /** Source portal */
  portal: [number, number];
}

export class NavGraph extends BaseGraph<
  NavNode, NavNodeOpts, NavEdge, NavEdgeOpts
> {

  public get json(): NavGraphJson {
    return {
      nodes: this.nodesArray.map(({ origOpts }) => origOpts),
      edges: this.edgesArray.map<NavEdgeOpts>(({ src, dst, otherOpts: { portal } }) => ({
        src: src.id,
        dst: dst.id,
        portal,
      })),
    };
  }

  public static from(polys: Poly2[]): NavGraph {
    const graph = new NavGraph(NavEdge);

    for (const { triangleIds } of polys) {
      triangleIds.forEach((pointIds) => {
        const node = new NavNode({ id: pointIds.join('-'), triIds: pointIds });
        graph.registerNode(node);
      });

      // adjs[pidA-pidB] is one or two triangle indexes
      const adjs = triangleIds.reduce(
        (agg, triple, triIndex) => {
          triple.forEach((i) => {
            const j = triple[(i + 1) % 3];
            const key = i < j ? `${i}-${j}` : `${j}-${i}`;
            (agg[key] = agg[key] || []).push(triIndex);
          });
          return agg;
        },
        {} as Record<string, number[]>
      );

      triangleIds.forEach((triple, triIndex) => {
        triple.forEach(i => {
          const j = triple[(i + 1) % 3];
          // Find at most one other triangle
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          const adjIds = adjs[key].filter(k => k !== triIndex);
          adjIds.forEach((otherIndex) => {
            graph.connect({
              src: triangleIds[triIndex].join('-'),
              dst: triangleIds[otherIndex].join('-'),
              portal: [i, j],
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
  edges: NavEdgeOpts[];
}
