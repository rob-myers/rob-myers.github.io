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
        const gmNode = { type: 'gm', gmKey: x.layoutKey, id: `gm-${x.layoutKey}-${x.transform}`, transform: x.transform  };
        return gmNode;        
      }),
      ...items.flatMap(x => {
        /** @type {Graph.GmGraphNodeDoor[]} */
        const doorNodes = x.hullDoors.map((y, hullDoorIndex) => ({
          type: 'door', gmKey: x.layoutKey, id: `door-${x.layoutKey}-${x.transform}-${hullDoorIndex}`, hullDoorIndex, transform: x.transform,
        }));
        return doorNodes;
      }),
    ];

    graph.registerNodes(nodes);

    // TODO edges, e.g. connect identified doors?

    return graph;
  }
}
