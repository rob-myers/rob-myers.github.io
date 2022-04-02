import { Poly } from "../geom";
import { BaseGraph } from "./graph";

/**
 * @extends {BaseGraph<Graph.RoomGraphNode, Graph.RoomGraphEdgeOpts>}
 */
export class RoomGraph extends BaseGraph {

  /**
   * Given nodes, find all adjacent doors.
   * @param {Graph.RoomGraphNode[]} nodes
   */
  getAdjacentDoors(nodes) {
    const doors = /** @type {Set<Graph.RoomGraphNodeDoor>} */ (new Set);
    nodes.forEach(node => this.getSuccs(node).forEach(other =>
      other.type === 'door' && doors.add(other))
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
      .filter(node => node.type === 'door' && openDoorIds.includes(node.doorIndex))
      .flatMap(doorNode => this.getSuccs(doorNode))
      .filter(/** @returns {other is Graph.RoomGraphNodeRoom} */
        (other) => other.id !== roomNode.id && other.type === 'room'
      );
  }

  /**
   * @param {Graph.RoomGraphJson} json 
   */  
  static fromJson(json) {
    return (new RoomGraph).from(json);
  }

 /**
  * @param {Geom.Poly[]} holes 
  * @param {Geom.Poly[]} doorPolys 
  */
  static holesAndDoorsToJson(holes, doorPolys) {
   /** @type {Graph.RoomGraphNode[]} */
   const roomGraphNodes = [
     ...holes.map((_, holeIndex) => ({ id: `hole-${holeIndex}`, type: /** @type {const} */ ('room'), holeIndex })),
     ...doorPolys.map((_, doorIndex) => ({ id: `door-${doorIndex}`, type: /** @type {const} */ ('door'), doorIndex  })),
   ];

   /** @type {Graph.RoomGraphEdgeOpts[]} */
   const roomGraphEdges = doorPolys.flatMap((door, doorIndex) => {
     const holeIds = holes.flatMap((hole, i) => Poly.union([hole, door]).length === 1 ? i : []);
     if (holeIds.length === 1 || holeIds.length === 2) {
       // Hull door (1) or standard door (2)
       return holeIds.flatMap(holeId => [// undirected means 2 directed edges
         { src: `hole-${holeId}`, dst: `door-${doorIndex}` },
         { dst: `hole-${holeId}`, src: `door-${doorIndex}` },
       ]);
     } else {
       console.warn(`door ${doorIndex}: unexpected adjacent holes: ${holeIds}`)
       return [];
     }
   });

   /** @type {Graph.RoomGraphJson} */
   const roomGraph = {
     nodes: roomGraphNodes,
     edges: roomGraphEdges,
   };

   return roomGraph;
 }

}
