import { BaseGraph } from "./graph";

/**
 * @extends {BaseGraph<Graph.FloorGraphNode, Graph.FloorGraphEdgeOpts>}
 */
export class FloorGraph extends BaseGraph {
  /**
   * @param {Graph.FloorGraphJson} json 
   * @returns {Graph.FloorGraph}
   */  
  static json(json) {
    // NOTE can cast Vect as VectJson
    return (new FloorGraph).plainFrom(json);
  }
}
