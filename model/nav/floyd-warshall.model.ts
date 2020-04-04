import { NavGraph } from './nav-graph.model';
import { Vector2 } from '@model/vec2.model';
import { Rect2 } from '@model/rect2.model';

export class FloydWarshall {
  
  public dist: { [srcId: string]: { [dstId: string]: number  } };
  public next: { [srcId: string]: { [dstId: string]: null | string  } };
  /** All node positions, aligned to `this.navGraph.nodesArray` */
  private allPositions: Vector2[];
  private tempPoint: Vector2;

  constructor(public navGraph: NavGraph) {
    this.dist = {};
    this.next = {};
    this.allPositions = [];
    this.tempPoint = Vector2.zero;
  }

  public findPath(src: Vector2, dst: Vector2): Vector2[] {
    const { srcNode, dstNode } = this.findPathEndNodes(src, dst);
    // Handle unnavigable nodes, or nodes in disjoint polys
    if (!srcNode || !dstNode) return [];

    const nodes = [srcNode];
    let node = srcNode;
    while (node !== dstNode) nodes.push(node = this.navGraph.getNodeById(this.next[node.id]![dstNode.id]!)!);

    return this.simplifyPath([
      src,
      ...nodes.map(({ opts: { globalId } }) => this.allPositions[globalId]),
      dst,
    ]);
  }

  private findPathEndNodes(src: Vector2, dst: Vector2) {
    const srcNearbys = this.navGraph.findNearbyPoints(src);
    const dstNearbys = this.navGraph.findNearbyPoints(dst);

    if (!srcNearbys || !dstNearbys) {
      return { srcNode: null, dstNode : null };
    } else if (srcNearbys.polyId !== dstNearbys.polyId) {
      return { srcNode: null, dstNode : null };
    }
    let closest = {
      srcId: null as null | string,
      dstId: null as null | string,
      dist: Number.POSITIVE_INFINITY,
    };
    srcNearbys.choices.forEach(({ nodeId: srcId, dist: srcDist }) =>
      dstNearbys.choices.forEach(({ nodeId: dstId, dist: dstDist }) => {
        const dist = srcDist + this.dist[srcId][dstId] + dstDist;
        // console.log({ srcId, dstId, srcDist, midDst: this.dist[srcId][dstId], dstDist });
        (dist < closest.dist) && (closest = { srcId, dstId, dist });
      })
    );
    return {
      srcNode: this.navGraph.getNodeById(closest.srcId!)!,
      dstNode: this.navGraph.getNodeById(closest.dstId!)!,
    };
  }

  /**
   * Find some rectangle containing every point.
   * NOTE a point might be contained in 1, 2 or 3 rects.
   * TODO better approach e.g. via BSP
   */
  private findRect(points: Vector2[]): Rect2 | null;
  private findRect(point: Vector2): Rect2 | null;
  private findRect(input: Vector2 | Vector2[]) {
    if (Array.isArray(input)) {
      return this.navGraph.rects.find(r => input.every(p => r.contains(p))) || null;
    }
    return this.navGraph.rects.find(r => r.contains(input)) || null;
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
        if (i > j) {
          return;
        } else if (vA === vB) {
          this.dist[vA.id][vB.id] = 0;
          this.next[vA.id][vB.id] = vA.id;
        } else if (
          this.navGraph.isConnected(vA, vB)
          || this.navGraph.isVisibleFrom(vA, vB)
        ) {
          const dist = Math.round(
            this.tempPoint.copy(this.allPositions[j]).sub(this.allPositions[i]).length
          );
          this.dist[vA.id][vB.id] = dist;
          this.dist[vB.id][vA.id] = dist;
          this.next[vA.id][vB.id] = vB.id;
          this.next[vB.id][vA.id] = vA.id;
        }
      })
    );
  }

  /**
   * TODO better method
   * Try to eliminate 2nd and/or penultimate point in path.
   */
  private simplifyPath(path: Vector2[]) {
    if (path.length >= 3) {
      if (this.findRect(path.slice(0, 3))) {
        path.splice(1, 1);
      }
      if (path.length >= 3 && this.findRect(path.slice(-3))) {
        path.splice(path.length - 2, 1);
      }
    }
    return path;
  }
}
