import { Poly2, Poly2Json } from '@model/poly2.model';
import { BaseGraph, BaseNode, BaseNodeOpts, BaseEdge, BaseEdgeOpts } from '@model/graph.model';
import { Vector2 } from '@model/vec2.model';
import { redact } from '@model/redux.model';
import { NavPortal } from './nav-channel';

interface NavNodeOpts extends BaseNodeOpts {
  /** Index of polygon this node occurs in */
  polyId: number;
  /** Index of triangle in triangulation of polygon */
  triId: number;
  /** Indices of points in polygon defining the triangle */
  pointIds: [number, number, number];
}

/** Represents a triangle in navmesh */
export class NavNode extends BaseNode<NavNodeOpts> {}

interface NavEdgeOpts extends BaseEdgeOpts<NavNode> {
  /** Indices in `src`s triangle shared by `src` and `dst` */
  portal: [0 | 1 | 2, 0 | 1 | 2];
}

/** Represents a portal in navmesh */
class NavEdge extends BaseEdge<NavNode, NavEdgeOpts> {}

export class NavGraph extends BaseGraph<
NavNode, NavNodeOpts, NavEdge, NavEdgeOpts
> {

  constructor(
    /**
     * Triangles grouped by original polygon,
     * so can easily recognise disjointness.
     */
    public groupedTris: Poly2[][]
  ) {
    super(NavEdge);
  }

  /** Needs original polygons (not triangles) as input */
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
      groupedTris: this.groupedTris.map(tris => tris.map(p => p.json)),
    };
  }

  /**
   * Compute from navigable floors.
   */
  public static from(navFloors: Poly2[]): NavGraph {
    const groupedTris = navFloors.map(p => p.triangulation);
    const graph = new NavGraph(groupedTris.map(p => redact(p)));
    /**
     * Triangles and triangleIds based on all points i.e.
     * each polygon can contribute outline, holes, steiner points.
     */
    const allPoints = navFloors.flatMap(p => p.allPoints);

    for (const [polyId, { triangleIds }] of navFloors.entries()) {
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
              portal: [
                groupedTris[polyId][triIndex].points
                  .findIndex(p => p.equals(allPoints[pidA])) as 0 | 1 | 2,
                groupedTris[polyId][triIndex].points
                  .findIndex(p => p.equals(allPoints[pidB])) as 0 | 1 | 2,
              ],
            });
          });
        });
      });
    }
    return graph;
  }

  public getPortal({ src: { opts }, otherOpts: { portal } }: NavEdge): NavPortal {
    const { points } = this.groupedTris[opts.polyId][opts.triId];
    return { left: points[portal[0]], right: points[portal[1]] };
  }

  public static fromJson({ nodes, edges, groupedTris }: NavGraphJson): NavGraph {
    const graph = new NavGraph(groupedTris.map(tris => tris.map(p => redact(Poly2.fromJson(p)))));
    nodes.forEach((nodeOpts) => graph.registerNode(new NavNode(nodeOpts)));
    edges.forEach(edgeOpts => graph.connect(edgeOpts));
    return graph;
  }

}

export interface NavGraphJson {
  nodes: NavNodeOpts[];
  edges: NavEdgeJson[];
  groupedTris: Poly2Json[][];
}

interface NavEdgeJson {
  src: string;
  dst: string;
  portal: [0 | 1 | 2, 0 | 1 | 2];
}
