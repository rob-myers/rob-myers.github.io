import { Poly } from "../geom";
import { BaseGraph } from "./graph";
import { error } from "../service/log";

/**
 * @extends {BaseGraph<Graph.RoomGraphNode, Graph.RoomGraphEdgeOpts>}
 */
export class RoomGraph extends BaseGraph {

  /**
   * Given nodes, find all adjacent doors.
   * @param {...Graph.RoomGraphNode} nodes
   */
  getAdjacentDoors(...nodes) {
    const doors = /** @type {Set<Graph.RoomGraphNodeDoor>} */ (new Set);
    nodes.forEach(node => this.getSuccs(node).forEach(other =>
      other.type === 'door' && doors.add(other))
    );
    return Array.from(doors);
  }
  /**
   * Given parent `gm` and some nodes, find adjacent _hull door ids_ (if any).
   * @param {Geomorph.GeomorphDataInstance} gm
   * @param {...Graph.RoomGraphNode} nodes
   */
  getAdjacentHullDoorIds(gm, ...nodes) {
    return this.getAdjacentDoors(...nodes)
      .map(node => /** @type {const} */ ([node, gm.doors[node.doorIndex]]))
      .flatMap(([{ doorIndex }, door]) => door.roomIds.some(x => x === null)
        ? { doorIndex, hullDoorIndex: gm.hullDoors.indexOf(door) } : []
      );
  }

  /**
   * Given nodes, find all adjacent windows.
   * @param {...Graph.RoomGraphNode} nodes
   */
  getAdjacentWindows(...nodes) {
    const windows = /** @type {Set<Graph.RoomGraphNodeWindow>} */ (new Set);
    nodes.forEach(node => this.getSuccs(node).forEach(other =>
      other.type === 'window' && windows.add(other))
    );
    return Array.from(windows);
  }

  /**
   * Given nodes, find all adjacent rooms.
   * @param {...Graph.RoomGraphNode} nodes
   */
  getAdjacentRooms(...nodes) {
    const rooms = /** @type {Set<Graph.RoomGraphNodeRoom>} */ (new Set);
    nodes.forEach(node => this.getSuccs(node).forEach(other =>
      other.type === 'room' && rooms.add(other))
    );
    return Array.from(rooms);
  }

  /** @param {number} doorIndex */
  getDoorNode(doorIndex) {
    return /** @type {Graph.RoomGraphNodeDoor} */ (this.getNodeById(`door-${doorIndex}`));
  }

  /** @param {number} windowIndex */
  getWindowNode(windowIndex) {
    return /** @type {Graph.RoomGraphNodeWindow} */ (this.getNodeById(`window-${windowIndex}`));
  }

  /** @param {number} roomIndex */
  getRoomNode(roomIndex) {
    return /** @type {Graph.RoomGraphNodeRoom} */ (this.getNodeById(`room-${roomIndex}`));
  }

  /**
   * __UNUSED__
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
  static from(json) {
    return (new RoomGraph).plainFrom(json);
  }

  /**
  * @param {Geom.Poly[]} rooms 
  * @param {Geomorph.ParsedLayout['doors']} doors 
  * @param {Geomorph.ParsedLayout['windows']} windows 
  * @returns {Graph.RoomGraphJson}
  */
  static json(rooms, doors, windows) {

    /**
     * For each door, the respective adjacent room ids.
     * Each array will be aligned with the respective door node's successors.
     */
    const doorsRoomIds = doors.map(door => rooms.flatMap((room, i) => Poly.union([room, door.poly]).length === 1 ? i : []));
    const windowsRoomIds = windows.map(window => rooms.flatMap((room, i) => Poly.union([room, window.poly]).length === 1 ? i : []));

    /** @type {Graph.RoomGraphNode[]} */
    const roomGraphNodes = [
      ...rooms.map((_, roomId) => ({
        id: `room-${roomId}`, type: /** @type {const} */ ('room'), roomId,
      })),
      ...doors.map((_, doorIndex) => {
        /** @type {Graph.RoomGraphNodeDoor} */
        const doorNode = { id: `door-${doorIndex}`, type: /** @type {const} */ ('door'), doorIndex };
        return doorNode;
      }),
      ...windows.map((_, windowIndex) => {
        /** @type {Graph.RoomGraphNodeWindow} */
        const windowNode = { id: `window-${windowIndex}`, type: /** @type {const} */ ('window'), windowIndex: windowIndex };
        return windowNode;
      }),
    ];

    /** @type {Graph.RoomGraphEdgeOpts[]} */
    const roomGraphEdges = [
      ...doors.flatMap((_door, doorIndex) => {
        const roomIds = doorsRoomIds[doorIndex];
        if ([1, 2].includes(roomIds.length)) {// Hull door has 1, standard has 2
          return roomIds.flatMap(roomId => [// undirected, so 2 directed edges
            { src: `room-${roomId}`, dst: `door-${doorIndex}` },
            { dst: `room-${roomId}`, src: `door-${doorIndex}` },
          ]);
        } else {
          error(`door ${doorIndex}: unexpected adjacent rooms: ${roomIds}`)
          return [];
        }
      }),
      ...windows.flatMap((_window, windowIndex) => {
        const roomIds = windowsRoomIds[windowIndex];
        if ([1,2].includes(roomIds.length)) {// Hull window has 1, standard has 2
          return roomIds.flatMap(roomId => [// undirected, so 2 directed edges
            { src: `room-${roomId}`, dst: `window-${windowIndex}` },
            { dst: `room-${roomId}`, src: `window-${windowIndex}` },
          ]);
        } else {
          error(`window ${windowIndex}: unexpected adjacent rooms: ${roomIds}`)
          return [];
        }
      }),
    ];

   /** @type {Graph.RoomGraphJson} */
   const roomGraphJson = {
     nodes: roomGraphNodes,
     edges: roomGraphEdges,
   };

   return roomGraphJson;
 }

}
