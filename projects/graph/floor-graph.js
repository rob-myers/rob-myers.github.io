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
  vectors = [];
  /** @type {number[][]} */
  doorNodeIds = [];

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

    // TODO 🚧 provide FloorGraph and context:
    // GeomorphDataInstance, gmIndex, doorsApi

    const nodePath = AStar.search(
      this,
      // this.nodesArray,
      closestNode,
      farthestNode
    );

    const channel = this.computeStringPull(src, dst, nodePath);
    const path = (/** @type {Geom.VectJson[]} */ (channel.path)).map(Vect.from);
    
    // Omit 1st point and discard adjacent repetitions
    const normalised = path.slice(1).reduce((agg, p) => {
      return agg.length && p.equals(agg[agg.length - 1])
        ? agg
        : agg.concat(p)
    }, /** @type {Geom.Vect[]} */ ([]));

    return { path: normalised, nodePath };
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
    const graph = new FloorGraph;
    const { groups: [navNodes], vertices } = zone;

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

    graph.vectors = vertices.map(Vect.from);
    graph.doorNodeIds = zone.doorNodeIds;

    return graph;
  }

  /**
   * Unused because `Graph.FloorGraphJson` larger than `Nav.Zone`.
   * @param {Graph.FloorGraphJson} json
   * @returns {Graph.FloorGraph}
   */  
  static from(json) {
    const graph = new FloorGraph;
    const { nodes, edges, vectors, doorNodeIds } = json;

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

    graph.vectors = vectors.map(Vect.from);
    graph.doorNodeIds = doorNodeIds;

    return graph;
  }

}
