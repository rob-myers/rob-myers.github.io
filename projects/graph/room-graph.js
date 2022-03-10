import { BaseGraph } from "./graph";

/**
 * @extends {BaseGraph<Graph.RoomNodeOpts, Graph.RoomGraphNode, Graph.RoomEdgeOpts>}
 */
export class RoomGraph extends BaseGraph {

  /**
   * Given nodes, find all adjacent doors.
   * @param {Graph.RoomGraphNode[]} nodes
   */
  getAdjacentDoors(nodes) {
    const doors = /** @type {Set<Graph.BaseNode<Graph.RoomOfTypeDoor>>} */ (new Set);
    nodes.forEach(node => this.getSuccs(node).forEach(other =>
      other.opts.type === 'door' &&
      doors.add(/** @type {Graph.BaseNode<Graph.RoomOfTypeDoor>} */ (other)))
    );
    return Array.from(doors);
  }

  /**
   * Given a 'room' node, find all other rooms connected via an open 'door' node.
   * We assume the undirected graph is bipartite i.e. rooms only connect to doors.
   * @param {Graph.RoomGraphNode} roomNode
   * @param {number[]} openDoorIds
   */
  getEnterableRooms(roomNode, openDoorIds) {
    return this.getSuccs(roomNode)
      .filter(node => node.opts.type === 'door' && openDoorIds.includes(node.opts.doorIndex))
      .flatMap(doorNode => this.getSuccs(doorNode))
      .filter(/** @type {function(*): other is Graph.BaseNode<Graph.RoomOfTypeRoom>} */
        (other) => other.id !== roomNode.id && other.opts.type === 'room'
      );
  }

  /**
   * @param {Graph.RoomGraphJson} json 
   */  
  static fromJson(json) {
    return (new RoomGraph).from(json);
  }

}
