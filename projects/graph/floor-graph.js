import { Vect } from "../geom";
import { BaseGraph } from "./graph";
import { Utils } from "../pathfinding/Utils";
import { AStar } from "../pathfinding/AStar";
import { Channel } from "../pathfinding/Channel";
import { assertDefined, assertNonNull, extantLast } from "../service/generic";
import { warn } from "../service/log";
import { geom } from "../service/geom";

/**
 * @extends {BaseGraph<Graph.FloorGraphNode, Graph.FloorGraphEdgeOpts>}
 */
export class floorGraphClass extends BaseGraph {

  /** @type {Geomorph.GeomorphData} */
  gm;
  /** @type {Geom.Vect[]} */
  vectors;
  /**
   * Inverse of `doorNodeIds` and `roomToNodeIds`.
   * - We assume no nav node touches > 1 door.
   * - We assume no triangle resides in > 1 room.
   * @type {Record<number, NPC.NavNodeMeta>}
   */
  nodeToMeta;

  /**
   * @param {Geomorph.GeomorphData} gm 
   */
  constructor(gm) {
    super();

    this.gm = gm;
    this.vectors = gm.navZone.vertices.map(Vect.from);

    /**
     * Compute `this.nodeToMeta` via `gm.navZone.{doorNodeIds,roomNodeIds}`.
     * Observe that a nodeId can e.g. point to a node in 2nd group.
     */
    const preNavNodes = gm.navZone.groups.flatMap(x => x);
    this.nodeToMeta = preNavNodes.map((_) => ({ doorId: -1, roomId: -1 }));
    gm.navZone.doorNodeIds.forEach((nodeIds, doorId) => {
      nodeIds.forEach(nodeId => this.nodeToMeta[nodeId].doorId = doorId);
    });
    gm.navZone.roomNodeIds.forEach((nodeIds, roomId) => {
      nodeIds.forEach(nodeId => this.nodeToMeta[nodeId].roomId = roomId);
    });
  }

  // /**
  //  * Mutates the alternating sequence `seq`.
  //  * @param {NPC.LocalNavPath['seq']} seq 
  //  */
  // cleanStringPull(seq) {
  //   for (const entry of seq.entries()) {
  //     if (!Array.isArray(entry[1])) {
  //       continue;
  //     } else if (entry[1].length <= 1) {
  //       warn(`cleanStringPull: short pulledPath ${JSON.stringify(entry[1])}`);
  //       continue;
  //     }
  //     const [itemId, path] = entry;

  //     // If just traversed an edge, ensure 2nd point not inside doorway
  //     let roomEdge = /** @type {NPC.NavRoomTransition | undefined} */ (seq[itemId - 1]);
  //     if (roomEdge) {
  //       const door = this.gm.doors[roomEdge.doorId];
  //       if (door.rect.contains(path[1])) path.splice(1, 1);
  //     }
  //     // If will traverse an edge, ensure penultimate point not inside doorway
  //     roomEdge = /** @type {NPC.NavRoomTransition | undefined} */ (seq[itemId + 1]);
  //     if (roomEdge) {
  //       const door = this.gm.doors[roomEdge.doorId];
  //       if (door.rect.contains(path[path.length - 2])) path.splice(path.length - 2, 1);
  //     }

  //     // Avoid duplicate adjacent vertices (they can happen)
  //     seq[itemId] = geom.removePathReps(path);
  //   }
  // }

  /**
   * @param {Geom.Vect} src in geomorph local coords
   * @param {Geom.Vect} dst in geomorph local coords
   * @returns {null | NPC.BaseLocalNavPath}
   */
  findPath(src, dst) {
    const srcNode = this.getClosestNode(src);
    const dstNode = this.getClosestNode(dst);
    if (!srcNode || !dstNode) {
      return null;
    }
    /**
     * Apply astar implementation originally from:
     * https://github.com/donmccurdy/three-pathfinding/blob/ca62716aa26d78ad8641d6cebb393de49dd70e21/src/Pathfinding.js#L106
     */
    const nodePath = AStar.search(this, srcNode, dstNode);

    /**
     * Partition of nodePath into alternating lists of door/room nodes.
     */
    const partition = nodePath.reduce((agg, node) => {
      const prev = agg.length ? agg[agg.length - 1] : undefined;
      const meta = this.nodeToMeta[node.index];
      const key = meta.doorId >= 0 ? 'door' : 'room';
      if (prev?.key === key) {
        prev.nodes.push(node);
      } else {
        agg.push(key === 'door'
          ? { key, nodes: [node], doorId: meta.doorId }
          : { key, nodes: [node], roomId: meta.roomId }
        );
        if (key === 'room' && meta.roomId === -1) {
          console.warn(`findPathNew: expected roomId for node`, node, meta);
        }
      }
      return agg;
    }, /** @type {({ nodes: Graph.FloorGraphNode[] } & ({ key: 'door'; doorId: number } | { key: 'room'; roomId: number }))[]} */ ([]));

    const fullPath = [src.clone()];
    const navMetas = /** @type {NPC.BaseLocalNavPath['navMetas']} */ ([]);
    let startDoorId = -1, endDoorId = -1;

    for (const [i, item] of partition.entries()) {
      if (item.key === 'door') {

        const door = this.gm.doors[item.doorId];

        if (i > 0) {// We exited previous room
          const roomId = /** @type {{ roomId: number }} */ (partition[i - 1]).roomId;
          /**
           * TODO
           * - need to skip doorEntry when start inside doorway
           * - need door exit when start inside doorway
           */
          // const roomIdIndex = door.roomIds.findIndex(x => x === roomId);
          // const dp = dst.clone().sub(door.entries[roomIdIndex]).dot(door.normal);
          // const sign = roomIdIndex === 0 ? 1 : -1;
          // if (!partition[i + 1] && dp * sign > 0) {
          //   // Dst has not reached door rect, so discard prev door entry
          //   console.log('IN DOORWAY BUT NOT DOOR RECT');
          //   fullPath.pop();
          //   fullPath.push(dst.clone());
          //   break;
          // }
          navMetas.push({
            key: 'exit-room',
            index: fullPath.length - 1,
            doorId: item.doorId,
            hullDoorId: this.gm.hullDoors.indexOf(door),
            exitedRoomId: roomId,
            otherRoomId: door.roomIds[1 - door.roomIds.findIndex(x => x === roomId)],
          });
        } else {
          startDoorId = item.doorId;
        }

        if (!partition[i + 1]) {// Finish in door
          fullPath.push(dst.clone());
          endDoorId = item.doorId;
          break;
        } 
        
        /** Have next node with nextRoomId */
        const nextRoomId = /** @type {{ roomId: number }} */ (partition[i + 1]).roomId;
        const doorExit =door.entries[door.roomIds.findIndex(x => x === nextRoomId)];
        
        // Avoid case where just entered geomorph and doorExit ~ src
        if (!(i == 0 && src.distanceTo(doorExit) < 0.1)) {
          fullPath.push(doorExit.clone());
        }

      } else {
        const roomId = item.roomId;

        // Compute endpoints of path through room
        const pathSrc = i === 0 ? src : fullPath[fullPath.length - 1];
        let pathDst = dst;
        if (i < partition.length - 1) {
          const door = this.gm.doors[/** @type {{ doorId: number }} */ (partition[i + 1]).doorId];
          // Given next door node, pathDst should be door entry for roomId
          pathDst = door.entries[door.roomIds.findIndex(x => x === roomId)];
        }

        if (i > 0) {// We entered this room
          const doorId = /** @type {{ doorId: number }} */ (partition[i - 1]).doorId;
          const door = this.gm.doors[doorId];

          navMetas.push({
            key: 'enter-room',
            index: fullPath.length - 1,
            doorId,
            hullDoorId: this.gm.hullDoors.indexOf(door),
            enteredRoomId: roomId,
            otherRoomId: door.roomIds[1 - door.roomIds.findIndex(x => x === roomId)],
          });
        }

        // Can we simply walk straight through the room?
        const roomNavPoly = this.gm.lazy.roomNavPoly[roomId];
        const directPath = !geom.lineSegCrossesPolygon(pathSrc, pathDst, roomNavPoly);
        if (directPath) {
          fullPath.push(pathDst.clone());
          continue;
        }

        // Otherwise, use "simple stupid funnel algorithm"
        const stringPull = /** @type {Geom.VectJson[]} */ (
          this.computeStringPull(pathSrc, pathDst, item.nodes).path
        ).map(Vect.from);

        fullPath.push(...stringPull.slice(1));
      }
    }

    console.log('findPath', {nodePath, nodeMetas: nodePath.map(x => this.nodeToMeta[x.index]) , partition, fullPath, navMetas}); // DEBUG 🚧

    return {
      fullPath, // May contain adjacent dups
      navMetas,
      startEndDoorIds: [startDoorId, endDoorId],
    };
  }

  /**
   * https://github.com/donmccurdy/three-pathfinding/blob/ca62716aa26d78ad8641d6cebb393de49dd70e21/src/Pathfinding.js#L78
   * Returns the closest node to the target position.
   * @param  {Geom.VectJson} position
   */
  getClosestNode(position) {
    const nodes = this.nodesArray;
    const vectors = this.vectors;
    let closestNode = /** @type {null | Graph.FloorGraphNode} */ (null);
    let closestDistance = Infinity;

    nodes.forEach((node) => {
      const distance = node.centroid.distanceToSquared(position);
      if (distance < closestDistance && Utils.isVectorInPolygon(position, node, vectors)) {
        closestNode = node;
        closestDistance = distance;
      }
    });

    if (!closestNode) {// Fallback to centroids (possibly initial zig-zag)
      nodes.forEach((node) => {
        const distance = Utils.distanceToSquared(node.centroid, position);
        if (distance < closestDistance) {
          closestNode = node;
          closestDistance = distance;
        }
      });
    }

    return /** @type {Graph.FloorGraphNode} */ (closestNode);
  }

  /**
   * @private
   * @param {Graph.FloorGraphNode} a 
   * @param {Graph.FloorGraphNode} b
   */
  getPortalFromTo(a, b) {
    for (let i = 0; i < a.neighbours.length; i++) {
      if (a.neighbours[i] === b.index) {
        return a.portals[i];
      }
    }
  }

  /**
   * @param {Geom.VectJson} src
   * @param {Geom.VectJson} dst
   * @param {Graph.FloorGraphNode[]} nodePath 
   */
  computeStringPull(src, dst, nodePath) {
    // We have the corridor, now pull the rope
    const channel = new Channel;
    channel.push(src);
    for (let i = 0; i < nodePath.length; i++) {
      const polygon = nodePath[i];
      const nextPolygon = nodePath[i + 1];

      if (nextPolygon) {
        const portals = /** @type {number[]} */ (this.getPortalFromTo(polygon, nextPolygon));
        channel.push(
          this.vectors[portals[0]],
          this.vectors[portals[1]],
        );
      }
    }
    channel.push(dst);
    channel.stringPull();
    return channel;
  }

  /**
   * We assume `gm.navZone` has exactly one group,
   * i.e. floor of geomorph (sans doors) is connected.
   * @param {Geomorph.GeomorphData} gm
   * @returns {Graph.FloorGraph}
   */
  static fromZone(gm) {
    const zone = gm.navZone;

    const { groups: navNodeGroups, vertices } = zone;
    const graph = new floorGraphClass(gm);
    const navNodes = navNodeGroups.flatMap(x => x);

    for (const [nodeId, node] of Object.entries(navNodes)) {
      graph.registerNode({
        type: 'tri',
        id: `tri-${nodeId}`,
        index: Number(nodeId),
        vertexIds: node.vertexIds.slice(),
        portals: node.portals.map(x => x.slice()),

        cost: 1,
        visited: false,
        closed: false,
        parent: null,
        centroid: Vect.from(node.centroid),

        neighbours: node.neighbours.slice(),
      });
    }

    for (const [nodeId, node] of Object.entries(navNodes)) {
      const graphNodeId = `tri-${nodeId}`;
      const neighbourIds = node.neighbours.map(otherNodeId => `tri-${otherNodeId}`);
      // Nav.Zone already "symmetric", so no need for double edges
      neighbourIds.forEach(nhbrNodeId =>
        graph.registerEdge({ src: graphNodeId, dst: nhbrNodeId })
      );
    }

    return graph;
  }

}
