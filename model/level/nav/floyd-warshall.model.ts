import { NavGraph, NavNode } from './nav-graph.model';
import { Vector2 } from '@model/vec2.model';
import { Rect2 } from '@model/rect2.model';
import { ViewGraph } from './view-graph.model';

export class FloydWarshall {
  /**
   * Shortest distance of a path between src and dst node,
   * where each edge is a walkable straight line between nodes.
   * If unreachable then the distance is positive infinity.
   */
  public dist: { [srcId: string]: { [dstId: string]: number  } };
  /** Next node in shortest path from src to dst. */
  public next: { [srcId: string]: { [dstId: string]: string | undefined } };
  /** Line of sight in navmesh i.e. line of walk */
  public los: { [srcId: string]: { [distId: string]: true } };
  /** All node positions, aligned to `this.navGraph.nodesArray` */
  private allPositions: Vector2[];
  private tempPoint: Vector2;

  constructor(
    private navGraph: NavGraph,
    private viewGraph: ViewGraph,
  ) {
    this.dist = {};
    this.next = {};
    this.los = {};
    this.allPositions = [];
    this.tempPoint = Vector2.zero;
  }

  /** Find path between two positions using precomputed paths. */
  public findPath(src: Vector2, dst: Vector2): Vector2[] {
    // TODO should already know rect of actor
    const srcRes = this.viewGraph.findRect(src);
    const dstRes = this.viewGraph.findRect(dst);

    if (!srcRes || !dstRes || srcRes.polyId !== dstRes.polyId) {
      return []; // Unnavigable
    }
    const [srcKey, dstKey] = [srcRes.rect.key, dstRes.rect.key];
    if (this.viewGraph.isVisibleFrom(srcKey, src, dstKey, dst)) {
      return [src, dst]; // Straight line walkable
    }
    
    // Find optimal nodes on rects containing `src` and `dst`
    const { srcNode, dstNode } = this.findClosestNavNodes(srcKey, src, dstKey, dst);
    const nodes = [srcNode];
    let node = srcNode;
    while (node !== dstNode) nodes.push(
      node = this.navGraph.getNodeById(this.next[node.id]![dstNode.id]!)!
    );

    // TODO better simplify
    return this.simplifyPath([
      src,
      ...nodes.map(({ opts: { globalId } }) => this.allPositions[globalId]),
      dst,
    ]);
  }

  private findClosestNavNodes(srcRectKey: string, src: Vector2, dstRectKey: string, dst: Vector2) {
    const { choices: srcChoices } = this.navGraph.findNearbyPoints(srcRectKey);
    const { choices: dstChoices } = this.navGraph.findNearbyPoints(dstRectKey);
    let closest: { srcId?: string; dstId?: string; dist: number } = {
      dist: Number.POSITIVE_INFINITY,
    };
    srcChoices.forEach(({ nodeId: srcId, point: srcPos }) =>
      dstChoices.forEach(({ nodeId: dstId, point: dstPos }) => {
        const dist = src.distanceTo(srcPos) + this.dist[srcId][dstId] + dst.distanceTo(dstPos);
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
   */
  private findRect(points: Vector2[]): Rect2 | null;
  private findRect(point: Vector2): Rect2 | null;
  private findRect(input: Vector2 | Vector2[]) {
    if (Array.isArray(input)) {
      return this.navGraph.rects.find(r => input.every(p => r.contains(p))) || null;
    }
    return this.navGraph.rects.find(r => r.contains(input)) || null;
  }

  public static from(navGraph: NavGraph, viewGraph: ViewGraph): FloydWarshall {
    const fm = new FloydWarshall(navGraph, viewGraph);
    fm.initialize();
    const [dist, next, los] = [fm.dist, fm.next, fm.los];

    // NavNode's grouped by polygon id
    const groupedNodes = navGraph.navPolys.map(({ allPoints }, polyIndex) =>
      allPoints.map(( _, vertexId) => navGraph.getNodeById(`${polyIndex}-${vertexId}`)!));

    // Floyd-Warshall algorithm
    groupedNodes.forEach((vs) => {
      vs.forEach(({ id: middleId }) => {
        vs.forEach(({ id: startId }) => {
          vs.forEach(({ id: endId }) => {
            if (los[startId][endId]) {
              return;
            }
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
    const { nodesArray: vs } = this.navGraph;

    // Distances initially infinite
    const innerDist = vs.reduce<Record<string, number>>((agg, { id }) =>
      ({ ...agg, [id]: Number.POSITIVE_INFINITY }), {});
    this.dist = vs.reduce((agg, v) => ({ ...agg, [v.id]: { ...innerDist } }), {});
    this.next = vs.reduce((agg, v) => ({ ...agg, [v.id]: {} }), {});
    this.los = vs.reduce((agg, v) => ({ ...agg, [v.id]: {} }), {});
    this.allPositions = this.navGraph.navPolys.flatMap(({ allPoints }) => allPoints);

    vs.forEach((vA, i) => {      
      vs.forEach((vB, j) => {
        if (vA.id > vB.id) {
          return;
        } else if (vA === vB) {
          this.dist[vA.id][vB.id] = 0;
          this.next[vA.id][vB.id] = vA.id;
          this.los[vA.id][vA.id] = true;
        } else if (this.nodesStraightWalkable(vA, vB)) {
          const dist = Math.round(this.tempPoint
            .copy(this.allPositions[j]).sub(this.allPositions[i]).length);
          this.dist[vA.id][vB.id] = this.dist[vB.id][vA.id] = dist;
          this.next[vA.id][vB.id] = vB.id;
          this.next[vB.id][vA.id] = vA.id;
          this.los[vA.id][vB.id] = this.los[vB.id][vA.id] = true;
        }
      });
    });
  }

  private nodesStraightWalkable(src: NavNode, dst: NavNode) {
    if (this.navGraph.isConnected(src, dst)) {
      return true;
    }
    const rectA = this.navGraph.nodeToRect.get(src)!;
    const posA = this.navGraph.nodeToPosition.get(src)!;
    const rectB = this.navGraph.nodeToRect.get(dst)!;
    const posB = this.navGraph.nodeToPosition.get(dst)!;
    return this.viewGraph.isVisibleFrom(`${rectA}`, posA, `${rectB}`, posB);
  }

  /**
   * TODO raycasts via ViewGraph
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
