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

  /** @param {number} doorIndex */
  getDoorNode(doorIndex) {
    return /** @type {Graph.RoomGraphNodeDoor} */ (this.getNodeById(`door-${doorIndex}`));
  }

  /** @param {number} roomIndex */
  getRoomNode(roomIndex) {
    return /** @type {Graph.RoomGraphNodeRoom} */ (this.getNodeById(`room-${roomIndex}`));
  }
  
  /**
   * @param {*} roomIndex The i^th room
   * @param {number} doorIndex The i^th door
   */
  getRoomSign(roomIndex, doorIndex) {
    const room = this.getRoomNode(roomIndex);
    const door = this.getDoorNode(doorIndex);
    const roomSuccIndex = /** @type {-1 | 0 | 1} */ (this.getSuccs(door).indexOf(room));
    return roomSuccIndex === -1 ? null : door.roomSigns[roomSuccIndex];
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
  * @param {Geomorph.Door<Poly>[]} doors 
  * @returns {Graph.RoomGraphJson}
  */
  static fromHolesAndDoors(holes, doors) {

    /**
     * For each door, the respective adjacent hole ids.
     * Each array will be aligned with the respective door node's successors.
     */
    const doorsHoleIds = doors.map(door => holes.flatMap((hole, i) => Poly.union([hole, door.poly]).length === 1 ? i : []));

    /** @type {Graph.RoomGraphNode[]} */
    const roomGraphNodes = [
      ...holes.map((_, holeIndex) => ({
        id: `room-${holeIndex}`, type: /** @type {const} */ ('room'), holeIndex,
      })),
      ...doors.map((door, doorIndex) => {
        const alongNormal = door.poly.center.addScaledVector(door.normal, 10);
        const roomSigns = doorsHoleIds[doorIndex].map(holeId => holes[holeId].contains(alongNormal) ? 1 : -1);
        return ({ id: `door-${doorIndex}`, type: /** @type {const} */ ('door'), doorIndex, roomSigns });
      }),
    ];

    /** @type {Graph.RoomGraphEdgeOpts[]} */
    const roomGraphEdges = doors.flatMap((_door, doorIndex) => {
      const holeIds = doorsHoleIds[doorIndex];
      if (
        holeIds.length === 1 // Hull door
        || holeIds.length === 2 // Standard door
      ) {
        return holeIds.flatMap(holeId => [// undirected, so 2 directed edges
          { src: `room-${holeId}`, dst: `door-${doorIndex}` },
          { dst: `room-${holeId}`, src: `door-${doorIndex}` },
        ]);
      } else {
        console.warn(`door ${doorIndex}: unexpected adjacent holes: ${holeIds}`)
        return [];
      }
    });

   /** @type {Graph.RoomGraphJson} */
   const roomGraphJson = {
     nodes: roomGraphNodes,
     edges: roomGraphEdges,
   };

   return roomGraphJson;
 }

}
