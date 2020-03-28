import { OldNavGraph, NavNode } from './old-nav-graph.model';
import { Vector2 } from '@model/vec2.model';
import { Poly2 } from '@model/poly2.model';
import NavChannel, { NavPortal } from './nav-channel';

/**
 * Floyd Warshall algorithm
 * https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/graph/floyd-warshall/floydWarshall.js
 */
export class FloydWarshall {

  public dist: { [srcId: string]: { [targetId: string]: number  } };
  public next: { [srcId: string]: { [targetId: string]: null | string  } };

  constructor(public navGraph: OldNavGraph) {
    this.dist = {};
    this.next = {};
  }

  /**
   * Find string-pulled path, if exists.
   */
  public findPath(src: Vector2, dst: Vector2): Vector2[] {
    const srcNode = this.findNode(src);
    const dstNode = this.findNode(dst);
    if (!srcNode || !dstNode) {
      return []; // Some node not navigable
    } else if (srcNode.opts.polyId !== dstNode.opts.polyId) {
      return []; // Nodes in disjoint polygons
    }

    const nodes = [srcNode];
    let node = srcNode;
    while (node !== dstNode) {
      nodes.push(node = this.navGraph.getNodeById(this.next[node.id]![dstNode.id]!)!);
    }
    
    // return nodes.map(node => this.getNodeCenter(node));
    const portals = this.getPortals(src, nodes, dst);
    return NavChannel.stringPull(portals);
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
  public static from(graph: OldNavGraph): FloydWarshall {
    const fm = new FloydWarshall(graph);
    fm.initialize();
    const [dist, next] = [fm.dist, fm.next];

    const groupedNodes = graph.groupedTris.map((tris, polyIndex) =>
      tris.map((_tri, triId) => graph.getNodeById(`${polyIndex}-${triId}`)!));

    groupedNodes.forEach((vs) => {
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
    });


    return fm;
  }

  private getNodeCenter(node: NavNode) {
    const { opts: { polyId, triId } } = this.navGraph.getNodeById(node.id)!;
    return this.navGraph.groupedTris[polyId][triId].centerOfBoundary;
  }

  private getPortals(src: Vector2, nodes: NavNode[], dst: Vector2) {
    const edges = nodes.slice(0, -1).map((src, i) => this.navGraph.getEdge(src, nodes[i + 1])!);
    return ([] as NavPortal[]).concat(
      { left: src, right: src },
      edges.map(edge => this.navGraph.getPortal(edge)),
      { left: dst, right: dst },
    );
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

    // Compute triangle centers so can approx distance between nodes
    const centers = vs.map(v => this.getNodeCenter(v));
    const point = Vector2.zero;

    vs.forEach((vA, i) =>
      vs.forEach((vB, j) => {
        if (vA === vB) {
          this.dist[vA.id][vB.id] = 0;
          this.next[vA.id][vB.id] = vA.id;
        } else if (this.navGraph.isConnected(vA, vB)) {
          // this.dist[vA.id][vB.id] = 1;
          this.dist[vA.id][vB.id] = Math.round(point.copy(centers[i]).sub(centers[j]).length);
          this.next[vA.id][vB.id] = vB.id;
          this.next[vB.id][vA.id] = vA.id;
        }
      })
    );
  }
}
