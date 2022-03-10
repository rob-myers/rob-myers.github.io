import { BaseGraph } from "./graph";

/**
 * @extends {BaseGraph<Graph.RoomNodeOpts, Graph.RoomGraphNode, Graph.RoomEdgeOpts>}
 */
export class RoomGraph extends BaseGraph {

  /**
   * Given a 'room' node, find all other rooms connected via an open 'door' node.
   * We assume the undirected graph is bipartite i.e. rooms only connect to doors.
   * @param {Graph.RoomGraphNode} node
   * @param {number[]} openDoorIds
   */
  getAdjacentRooms(node, openDoorIds) {
    return this.getSuccs(node)
      .filter(node => node.opts.type === 'door' && openDoorIds.includes(node.opts.doorIndex))
      .flatMap(doorNode => this.getSuccs(doorNode))
      .filter(/** @type {function(*): other is Graph.BaseNode<Graph.RoomOfTypeRoom>} */
        (other) => other.id !== node.id && other.opts.type === 'room'
      );
  }

  /**
   * @param {Graph.RoomGraphJson} json 
   */  
  static fromJson(json) {
    return (new RoomGraph).from(json);
  }

}
