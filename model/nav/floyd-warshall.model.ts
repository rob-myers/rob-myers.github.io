import { NavGraph } from './nav-graph.model';
import { Vector2 } from '@model/vec2.model';
import { Poly2 } from '@model/poly2.model';

/**
 * Floyd Warshall algorithm
 * https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/graph/floyd-warshall/floydWarshall.js
 */
export class FloydWarshall {

  public dist: { [srcId: string]: { [targetId: string]: number  } };
  public next: { [srcId: string]: { [targetId: string]: null | string  } };

  constructor(public navGraph: NavGraph) {
    this.dist = {};
    this.next = {};
  }

  /**
   * First attempt, without string-pulling.
   */
  public findPath(src: Vector2, dst: Vector2): Vector2[] {
    const srcNode = this.findNode(src);
    const dstNode = this.findNode(dst);
    if (!srcNode || !dstNode) {
      return []; // Some node not navigable
    } else if (srcNode.opts.polyId !== dstNode.opts.polyId) {
      return []; // Nodes in disjoint polygons
    }

    const nodeIds = [srcNode.id];
    let srcId = srcNode.id;
    while (srcId !== dstNode.id) {
      nodeIds.push(srcId = this.next[srcId]![dstNode.id]!);
    }
    return nodeIds.map(id => this.getNodeCenter(id));
  }

  private findNode(point: Vector2) {
    for (const [polyId, tris] of this.navGraph.groupedTris.entries()) {
      for (const [triId, { points: [u, v, w] }] of tris.entries()) {
        if (Poly2.isPointInTriangle(point, u, v, w)) {
          return this.navGraph.getNodeById(`${polyId}-${triId}`);
        }
      }
    }
    return null;
  }

  /** https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm */
  public static from(graph: NavGraph): FloydWarshall {
    const fm = new FloydWarshall(graph);
    fm.initialize();
    const [vs, dist, next] = [graph.nodesArray, fm.dist, fm.next];

    vs.forEach(({ id: middleId }) => {
      vs.forEach(({ id: startId }) => {
        vs.forEach(({ id: endId }) => {
          const altDist = dist[startId][middleId] + dist[middleId][endId];

          if (dist[startId][endId] > altDist) {
            dist[startId][endId] = altDist;
            next[startId][endId] = next[startId][middleId];
          }
        });
      });
    });

    return fm;
  }

  private getNodeCenter(nodeId: string) {
    const { opts: { polyId, triId } } = this.navGraph.getNodeById(nodeId)!;
    return this.navGraph.groupedTris[polyId][triId].centerOfBoundary;
  }

  private initialize() {
    // Distances initially infinite
    const { nodesArray: vs } = this.navGraph;
    const innerDist = vs.reduce<Record<string, number>>((agg, { id }) =>
      ({ ...agg, [id]: Number.POSITIVE_INFINITY }), {});
    this.dist = vs.reduce((agg, v) =>
      ({ ...agg, [v.id]: { ...innerDist } }), {});

    // Next vertices initially null
    const innerNext = vs.reduce<Record<string, null | string>>((agg, { id }) =>
      ({ ...agg, [id]: null }), {});
    this.next = vs.reduce((agg, v) =>
      ({ ...agg, [v.id]: { ...innerNext } }), {});

    vs.forEach((vA) =>
      vs.forEach((vB) => {
        if (vA === vB) {
          this.dist[vA.id][vB.id] = 0;
          this.next[vA.id][vB.id] = vA.id;
        } else if (this.navGraph.isConnected(vA, vB)) {
          this.dist[vA.id][vB.id] = 1;
          this.next[vA.id][vB.id] = vB.id;
          this.next[vB.id][vA.id] = vA.id;
        }
      })
    );
  }
}
