import { Vect } from "../geom";
import { BaseGraph } from "./graph";
import { Utils } from "../pathfinding/Utils";

/**
 * @extends {BaseGraph<Graph.FloorGraphNode, Graph.FloorGraphEdgeOpts>}
 */
export class FloorGraph extends BaseGraph {

  /** @type {Geom.Vect[]} */
  vectors = [];

  /**
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
   * We are casting various `Geom.Vect` as `Geom.VectJson`s
   * @returns {Graph.FloorGraphJson}
   */  
  json() {
    return {
      ...this.plainJson(),
      vectors: this.vectors,
    };
  }

  /**
   * We assume `zone` has exactly one group,
   * i.e. floor of geomorph (sans doors) is connected.
   * @param {Nav.Zone} zone
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

    graph.vectors = vertices;

    return graph;
  }

  /**
   * @param {Graph.FloorGraphJson} json
   * @returns {Graph.FloorGraph}
   */  
  static from(json) {
    const graph = new FloorGraph;
    const { nodes, edges, vectors } = json;

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

    return graph;
  }

}
