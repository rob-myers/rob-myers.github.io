import { Vect } from "../geom";
import { BaseGraph } from "./graph";

/**
 * @extends {BaseGraph<Graph.FloorGraphNode, Graph.FloorGraphEdgeOpts>}
 */
export class FloorGraph extends BaseGraph {

  /**
   * @returns {Graph.FloorGraphJson}
   */  
  json() {
    // NOTE we cast Geom.Vect as Geom.VectJson
    return this.plainJson();
  }

  /**
   * @param {Nav.Zone} zone
   * @returns {Graph.FloorGraph}
   */
  static from(zone) {
    const graph = new FloorGraph;
    const { groups, vertices } = zone;

    // NOTE probably only a single group,
    // i.e. the floor of each geomorph (sans doors) is connected
    for (const [grpId, navNodes] of Object.entries(groups)) {
      for (const [nodeId, node] of Object.entries(navNodes)) {
        graph.registerNode({
          type: 'tri',
          id: `tri-${nodeId}-${grpId}`,

          f: 0,
          g: 0,
          h: 0,
          cost: 1,
          visited: false,
          closed: false,
          parent: null,

          vertexIds: node.vertexIds.slice(),
          centroid: Vect.from(node.centroid),
          portals: node.portals.map(x => x.slice()),
        });
      }
      for (const [nodeId, node] of Object.entries(navNodes)) {
        const graphNodeId = `tri-${nodeId}-${grpId}`;
        const neighbourIds = node.neighbours.map(otherNodeId => `tri-${otherNodeId}-${grpId}`);
        // NOTE Nav.Zone already "symmetric" so no need to add double edges
        neighbourIds.forEach(nhbrNodeId =>
          graph.registerEdge({ src: graphNodeId, dst: nhbrNodeId })
        );
      }
    }

    return graph;
  }

}
