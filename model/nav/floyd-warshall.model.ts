import { NavGraph } from './nav-graph.model';
import { Vector2 } from '@model/vec2.model';
import { Poly2 } from '@model/poly2.model';

/**
 * TODO precompute Line-of-sight tests for each pair of vertices,
 * and use to simplify paths.
 */

export class FloydWarshall {
  
  public dist: { [srcId: string]: { [dstId: string]: number  } };
  public next: { [srcId: string]: { [dstId: string]: null | string  } };
  /**
   * All node positions, aligned to `this.navGraph.nodesArray`
   */
  private allPositions: Vector2[];
  private tempPoint: Vector2;

  constructor(public navGraph: NavGraph) {
    this.dist = {};
    this.next = {};
    this.allPositions = [];
    this.tempPoint = Vector2.zero;
  }

  /**
   * TODO expand search to 'close' vertex in adjacent triangle within line-of-sight
   * TODO faster lookup from position to triangles
   */
  private findSrcDstNode(src: Vector2, dst: Vector2) {
    const srcTri = this.findTriangle(src);
    const dstTri = this.findTriangle(dst);
    if (!srcTri || !dstTri || srcTri.polyId !== dstTri.polyId) {
      return null;
    }
    let closest = {
      srcId: null as null | string,
      dstId: null as null | string,
      dist: Number.POSITIVE_INFINITY,
    };
    srcTri.triple.forEach(({ nodeId: srcId, dist: srcDist }) =>
      dstTri.triple.forEach(({ nodeId: dstId, dist: dstDist }) => {
        const dist = srcDist + this.dist[srcId][dstId] + dstDist;
        (dist < closest.dist ) && (closest = { srcId, dstId, dist });
      })
    );
    return {
      srcNode: this.navGraph.getNodeById(closest.srcId!)!,
      dstNode: this.navGraph.getNodeById(closest.dstId!)!,
    };
  }

  public findPath(src: Vector2, dst: Vector2): Vector2[] {
    const ends = this.findSrcDstNode(src, dst);
    if (!ends) {
      return []; // Some node not navigable or nodes in disjoint polys
    }

    const { srcNode, dstNode } = ends;
    const nodes = [srcNode];
    let node = srcNode;
    while (node !== dstNode) {
      nodes.push(node = this.navGraph.getNodeById(this.next[node.id]![dstNode.id]!)!);
    }

    return [
      src,
      ...nodes.map(({ opts: { globalId } }) => this.allPositions[globalId]),
      dst,
    ];
  }

  private findTriangle(point: Vector2) {
    for (const [polyId, tris] of this.navGraph.groupedTris.entries()) {
      for (const [triId, { points: [u, v, w] }] of tris.entries()) {
        if (Poly2.isPointInTriangle(point, u, v, w)) {
          return {
            polyId,
            triple: this.navGraph.navPolys[polyId].triangleIds[triId].map((vertexId, i) => ({
              nodeId: `${polyId}-${vertexId}`,
              dist: this.tempPoint.copy(point)
                .sub(this.navGraph.groupedTris[polyId][triId].points[i]).length,
            })),
          };
        }
      }
    }
    return null;
  }

  public static from(graph: NavGraph): FloydWarshall {
    const fm = new FloydWarshall(graph);
    fm.initialize();
    const [dist, next] = [fm.dist, fm.next];

    const groupedNodes = graph.navPolys.map(({ allPoints }, polyIndex) =>
      allPoints.map(( _, vertexId) => graph.getNodeById(`${polyIndex}-${vertexId}`)!));

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

    // Each NavNode correponds to a vertex in a polygon
    this.allPositions = this.navGraph.navPolys.flatMap(({ allPoints }) => allPoints);

    vs.forEach((vA, i) =>
      vs.forEach((vB, j) => {
        if (vA === vB) {
          this.dist[vA.id][vB.id] = 0;
          this.next[vA.id][vB.id] = vA.id;
        } else if (this.navGraph.isConnected(vA, vB)) {
          this.dist[vA.id][vB.id] = Math.round(
            this.tempPoint.copy(this.allPositions[j]).sub(this.allPositions[i]).length
          );
          this.next[vA.id][vB.id] = vB.id;
          this.next[vB.id][vA.id] = vA.id;
        }
      })
    );
  }

  /**
   * Precompute line-of-sight and use to discard intermediates.
   */
  private simplifyPath() {
    // TODO
  }
}
