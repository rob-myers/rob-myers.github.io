import { BaseGraph } from "./graph";

/**
 * @extends {BaseGraph<Graph.RoomNodeOpts, Graph.RoomNode, Graph.RoomEdgeOpts>}
 */
export class RoomGraph extends BaseGraph {
  /**
   * Must be reimplemented in subclasses.
   * @param {Graph.RoomGraphJson} json 
   */  
  static fromJson(json) {
    return (new RoomGraph).from(json);
  }
}
