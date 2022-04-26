import { Vect } from "../geom";
import { BaseGraph } from "./graph";
import { Utils } from "../pathfinding/Utils";
import { AStar } from "../pathfinding/AStar";
import { Channel } from "../pathfinding/Channel";

/**
 * @extends {BaseGraph<Graph.FloorGraphNode, Graph.FloorGraphEdgeOpts>}
 */
export class FloorGraph extends BaseGraph {

  /** @type {Geom.Vect[]} */
  vectors;
  /** @type {number[][]}  */
  doorNodeIds;
  /**
   * Inverse of `doorNodeIds`,
   * assuming no nav node touches > 1 door.
   * @type {Record<number, number>}
   */
  nodeToDoorId;

  /**
   * 
   * @param {typeof this['vectors']} vectors 
   * @param {typeof this['doorNodeIds']} doorNodeIds 
   */
  constructor(vectors, doorNodeIds) {
    super();

    this.vectors = vectors;
    this.doorNodeIds = doorNodeIds;
    this.nodeToDoorId = doorNodeIds.reduce((agg, nodeIds, doorId) => {
      nodeIds.forEach(id => agg[id] = doorId)
      return agg;
    }, /** @type {typeof this['nodeToDoorId']} */ ({}));
  }

  /**
   * https://github.com/donmccurdy/three-pathfinding/blob/ca62716aa26d78ad8641d6cebb393de49dd70e21/src/Pathfinding.js#L106
   * @param {Geom.VectJson} src
   * @param {Geom.VectJson} dst 
   */
  findPath(src, dst) {
    const closestNode = this.getClosestNode(src);
    const farthestNode = this.getClosestNode(dst);
    if (!closestNode || !farthestNode) {
      return null; // We can't find any node
    }

    const nodePath = AStar.search(this, closestNode, farthestNode);
    if (nodePath.length === 0 && closestNode === farthestNode) {
      nodePath.push(closestNode); // Fix when src, dst in same triangle
    }

    // Split path by door nodes
    const doorIds = /** @type {number[]} */ ([]);
    const nodePaths = nodePath.reduce((agg, node) => {
      if (this.nodeToDoorId[node.index] === undefined) {
        agg.length ? agg[agg.length - 1].push(node) : agg.push([node]);
      } else {
        if (doorIds[doorIds.length - 1] !== this.nodeToDoorId[node.index]) {
          doorIds.push(this.nodeToDoorId[node.index]);
          agg.push([]);
        }
      }
      return agg;
    }, /** @type {Graph.FloorGraphNode[][]} */ ([]));

    if (nodePaths[nodePaths.length - 1]?.length === 0)
      nodePaths.pop(); // Fix trailing empty array when end at doorway

    const pulledPaths = nodePaths.map((nodePath, index) => {
      const pathSrc = index === 0 ? src : nodePath[0].centroid;
      const pathDst = index === nodePaths.length - 1 ? dst : nodePath[nodePath.length - 1].centroid;
      const path = /** @type {Geom.VectJson[]} */ (this.computeStringPull(pathSrc, pathDst, nodePath).path);
      return path.map(Vect.from);
    });

    // Omit 1st point and discard adjacent repetitions
    // TODO why repetitions?
    const normalisedPaths = pulledPaths.map((pulledPath, i) => {
      return (
        i ? pulledPath : pulledPath.slice(1)
      ).reduce((agg, p) =>
        agg.length && p.equals(agg[agg.length - 1]) ? agg : agg.concat(p)
      , /** @type {Geom.Vect[]} */ ([]));
    });

    return { normalisedPaths, nodePaths, doorIds }
  }

  /**
   * https://github.com/donmccurdy/three-pathfinding/blob/ca62716aa26d78ad8641d6cebb393de49dd70e21/src/Pathfinding.js#L78
   * Returns the closest node to the target position.
   * @param  {Geom.VectJson} position
   */
  getClosestNode(position) {
    const nodes = this.nodesArray;
    const vectors = this.vectors;
    let closestNode = /** @type {null | Graph.FloorGraphNode} */ (null);
    let closestDistance = Infinity;

    nodes.forEach((node) => {
      const distance = node.centroid.distanceToSquared(position);
      if (distance < closestDistance && Utils.isVectorInPolygon(position, node, vectors)) {
        closestNode = node;
        closestDistance = distance;
      }
    });

    if (!closestNode) {// Fallback to centroids (possibly initial zig-zag)
      nodes.forEach((node) => {
        const distance = Utils.distanceToSquared(node.centroid, position);
        if (distance < closestDistance) {
          closestNode = node;
          closestDistance = distance;
        }
      });
    }

    return /** @type {Graph.FloorGraphNode} */ (closestNode);
  }

  /**
   * @private
   * @param {Graph.FloorGraphNode} a 
   * @param {Graph.FloorGraphNode} b
   */
  getPortalFromTo(a, b) {
    for (let i = 0; i < a.neighbours.length; i++) {
      if (a.neighbours[i] === b.index) {
        return a.portals[i];
      }
    }
  }

  /**
   * @returns {Graph.FloorGraphJson}
   */  
  json() {
    return {
      ...this.plainJson(),
      vectors: this.vectors.map(p => p.json),
      doorNodeIds: this.doorNodeIds,
    };
  }

  /**
   * @param {Geom.VectJson} src
   * @param {Geom.VectJson} dst
   * @param {Graph.FloorGraphNode[]} nodePath 
   */
  computeStringPull(src, dst, nodePath) {
    // We have the corridor, now pull the rope
    const channel = new Channel;
    channel.push(src);
    for (let i = 0; i < nodePath.length; i++) {
      const polygon = nodePath[i];
      const nextPolygon = nodePath[i + 1];

      if (nextPolygon) {
        const portals = /** @type {number[]} */ (this.getPortalFromTo(polygon, nextPolygon));
        channel.push(
          this.vectors[portals[0]],
          this.vectors[portals[1]],
        );
      }
    }
    channel.push(dst);
    channel.stringPull();
    return channel;
  }

  /**
   * We assume `zone` has exactly one group,
   * i.e. floor of geomorph (sans doors) is connected.
   * @param {Nav.ZoneWithMeta} zone
   * @returns {Graph.FloorGraph}
   */
  static fromZone(zone) {
    const { groups: [navNodes], vertices } = zone;
    const graph = new FloorGraph(
      vertices.map(Vect.from),
      zone.doorNodeIds,
    );

    for (const [nodeId, node] of Object.entries(navNodes)) {
      graph.registerNode({
        type: 'tri',
        id: `tri-${nodeId}`,
        index: Number(nodeId),
        vertexIds: node.vertexIds.slice(),
        portals: node.portals.map(x => x.slice()),

        cost: 1,
        visited: false,
        closed: false,
        parent: null,
        centroid: Vect.from(node.centroid),

        neighbours: node.neighbours.slice(),
      });
    }

    for (const [nodeId, node] of Object.entries(navNodes)) {
      const graphNodeId = `tri-${nodeId}`;
      const neighbourIds = node.neighbours.map(otherNodeId => `tri-${otherNodeId}`);
      // Nav.Zone already "symmetric", so no need for double edges
      neighbourIds.forEach(nhbrNodeId =>
        graph.registerEdge({ src: graphNodeId, dst: nhbrNodeId })
      );
    }

    return graph;
  }

  /**
   * Unused because `Graph.FloorGraphJson` larger than `Nav.Zone`.
   * @param {Graph.FloorGraphJson} json
   * @returns {Graph.FloorGraph}
   */  
  static from(json) {
    const { nodes, edges, vectors, doorNodeIds } = json;
    const graph = new FloorGraph(
      vectors.map(Vect.from),
      doorNodeIds,
    );

    for (const node of nodes) {
      graph.registerNode({
        type: 'tri',
        id: node.id,
        index: node.index,
        vertexIds: node.vertexIds.slice(),
        portals: node.portals.map(x => x.slice()),

        cost: 1,
        visited: false,
        closed: false,
        parent: null,
        centroid: Vect.from(node.centroid),

        neighbours: [], // Mutated below
      });
    }

    for (const edge of edges) {
      graph.registerEdge(edge);
    }

    for (const jsonNode of nodes) {
      const node = /** @type {Graph.FloorGraphNode} */ (graph.getNodeById(jsonNode.id));
      node.neighbours = graph.getSuccs(node).map(({ index }) => index);
    }

    return graph;
  }

}
