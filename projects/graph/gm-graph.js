import { BaseGraph } from "./graph";

/**
 * GmGraph is short for _Geomorph Graph_
 * @extends {BaseGraph<Graph.GmGraphNode, Graph.GmGraphEdgeOpts>}
 */
export class GmGraph extends BaseGraph {

  /**
   * @param {Geomorph.UseGeomorphsItem[]} items 
   */
  static fromGmItems(items) {
    const graph = new GmGraph;

    /** @type {Graph.GmGraphNode[]} */
    const nodes = [
      ...items.map(x => {
        /** @type {Graph.GmGraphNodeGm} */
        const gmNode = { type: 'gm', gmKey: x.layoutKey, id: `gm-${x.layoutKey}-[${x.transform}]`, transform: x.transform  };
        return gmNode;        
      }),
      ...items.flatMap(x => x.hullDoors.map((_, hullDoorIndex) => {
        /** @type {Graph.GmGraphNodeDoor} */
        const doorNode = { type: 'door', gmKey: x.layoutKey, id: `door-${x.layoutKey}-[${x.transform}]-${hullDoorIndex}`, hullDoorIndex, transform: x.transform };
        return doorNode;
      })
      ),
    ];

    graph.registerNodes(nodes);

    // TODO edges
    // - specify edges exactly e.g. what about identified doors?
    // - detect when doors identified by
    //   - detecting aligned sides
    //   - doing rect intersect tests

    return graph;
  }
}
