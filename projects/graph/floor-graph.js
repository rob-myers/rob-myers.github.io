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

    // Compute `this.nodeToMeta` via `gm.navZone.{doorNodeIds,roomNodeIds}`.
    const preNavNodes = gm.navZone.groups[0];
    this.nodeToMeta = preNavNodes.map((_) => ({ doorId: -1, roomId: -1 }));
    gm.navZone.doorNodeIds.forEach((nodeIds, doorId) => {
      nodeIds.forEach(nodeId => this.nodeToMeta[nodeId].doorId = doorId);
    });
    gm.navZone.roomNodeIds.forEach((nodeIds, roomId) => {
      nodeIds.forEach(nodeId => this.nodeToMeta[nodeId].roomId = roomId);
    });
  }

  /**
   * Mutates the alternating sequence `seq`.
   * @param {NPC.LocalNavPath['seq']} seq 
   */
  cleanStringPull(seq) {
    for (const entry of seq.entries()) {
      if (!Array.isArray(entry[1])) {
        continue;
      } else if (entry[1].length <= 1) {
        warn(`cleanStringPull: short pulledPath ${JSON.stringify(entry[1])}`);
        continue;
      }
      const [itemId, path] = entry;

      // If just traversed an edge, ensure 2nd point not inside doorway
      let roomEdge = /** @type {NPC.NavRoomTransition | undefined} */ (seq[itemId - 1]);
      if (roomEdge) {
        const door = this.gm.doors[roomEdge.doorId];
        if (door.rect.contains(path[1])) path.splice(1, 1);
      }
      // If will traverse an edge, ensure penultimate point not inside doorway
      roomEdge = /** @type {NPC.NavRoomTransition | undefined} */ (seq[itemId + 1]);
      if (roomEdge) {
        const door = this.gm.doors[roomEdge.doorId];
        if (door.rect.contains(path[path.length - 2])) path.splice(path.length - 2, 1);
      }

      // Avoid duplicate adjacent vertices (they can happen)
      seq[itemId] = geom.removePathReps(path);
    }
  }

  /**
   * @param {NPC.NavNodeMeta} meta
   * Assume doorId ≥ 0, roomId ≥ 0 and door is not a hull door.
   * @param {number | null} prevRoomId
   * @returns {NPC.NavRoomTransition}
   */
  createRoomEdge(meta, prevRoomId) {
    const door = this.gm.doors[meta.doorId];
    const points = /** @type {[Geom.Vect, Geom.Vect]} */ (door.entries);
    return {
      key: 'room-edge',
      doorId: meta.doorId,
      srcRoomId: prevRoomId,
      dstRoomId: meta.roomId,
      start: door.roomIds[0] === meta.roomId ? points[1] : points[0],
      stop: door.roomIds[0] === meta.roomId ? points[0] : points[1],
    };
  }

  /**
   * Based on https://github.com/donmccurdy/three-pathfinding/blob/ca62716aa26d78ad8641d6cebb393de49dd70e21/src/Pathfinding.js#L106
   * @param {Geom.Vect} src in geomorph local coords
   * @param {Geom.Vect} dst in geomorph local coords
   * @returns {null | Pick<NPC.LocalNavPath, 'seq'>}
   */
  findPath(src, dst) {
    const srcNode = this.getClosestNode(src);
    const dstNode = this.getClosestNode(dst);
    if (!srcNode || !dstNode) {
      return null;
    }

    const nodePath = AStar.search(this, srcNode, dstNode);
    if (nodePath[0] !== srcNode) {
      // Fixes various issues, including:
      // - nodePath empty and src/dst same triangle
      // - nodePaths construction
      nodePath.unshift(srcNode);
    }
    if (extantLast(nodePath) !== dstNode) {
      nodePath.push(dstNode); // Needed?
    }

    /**
     * `nodePath` split by the room they reside in
     * - First path may not reside in any room (initial doorway)
     * - Final path may include part outside room (final doorway)
     */
    const nodePaths = /** @type {Graph.FloorGraphNode[][]} */ ([]);
    /** Always one fewer than nodePaths, but may add pre/post edge later */
    const roomEdges = /** @type {NPC.NavRoomTransition[]} */ ([]);
    /**
     * This is updated along `nodePath` whenever we see new valid roomId.
     * @type {NPC.NavNodeMeta}
     */
    let prevMeta = this.nodeToMeta[nodePath[0].index];
    nodePath.forEach(node => {
      const meta = this.nodeToMeta[node.index];
      if (nodePaths.length === 0) {
        nodePaths.push([node]);
        // Currently, prevMeta === meta
      } else if (meta.roomId === -1) {
        // Node outside any room i.e. properly in a doorway
        // console.warn('nav node in no room', node, meta);
        nodePaths[nodePaths.length - 1].push(node);
      } else if (meta.roomId === prevMeta.roomId) {
        // Node inside same room as previous node
        nodePaths[nodePaths.length - 1].push(node);
      } else {
        // Node inside new room (2nd or later), so start new path
        nodePaths.push([node]);
        // Just entered room, so node adjacent to a door
        // NOTE cannot be a hull door because entered from other side
        roomEdges.push(this.createRoomEdge(meta, prevMeta.roomId));
        prevMeta = meta;
      }
    });

    if (nodePaths.length >= 2 && extantLast(nodePaths).length === 1) {
      // Merge 1-paths obtained by finishing in doorway in next room
      nodePaths[nodePaths.length - 2].concat(nodePaths.pop() || []);
    } else if (nodePaths.length >= 2 && nodePaths[0].length === 1 && roomEdges[0].start === null) {
      // TODO clarify
      // Discard 1-paths obtained by starting in a doorway via global nav
      nodePaths.shift();
      roomEdges.shift();
    }

    /** @type {[null | NPC.NavRoomTransition, null | NPC.NavRoomTransition]} */
    let prePostEdges = [null, null];

    const initDoorId = this.nodeToMeta[nodePaths[0][0].index].doorId;
    const finalDoorId = this.nodeToMeta[extantLast(extantLast(nodePaths)).index].doorId;
    const startInDoorway = initDoorId >= 0 && this.gm.doors[initDoorId].poly.contains(src);
    const stopInDoorway = finalDoorId >= 0 && this.gm.doors[finalDoorId].poly.contains(dst);

    if (startInDoorway && stopInDoorway && initDoorId === finalDoorId) {
      console.log('WILL START/END IN SAME DOORWAY', initDoorId);
      return { seq: [{ key: 'room-edge', doorId: initDoorId, srcRoomId: null, dstRoomId: null, start: src, stop: dst }] };
    }
    if (startInDoorway) {
      console.log('WILL START IN DOORWAY', initDoorId);
      const door = this.gm.doors[initDoorId];
      // Either 1st or 2nd sub-nodePath should match initDoorId and have valid roomId
      const metas = nodePaths.slice(0, 2).flatMap(x => x).map(x => this.nodeToMeta[x.index]);
      const { roomId: dstRoomId } = assertDefined(metas.find(meta => meta.doorId === initDoorId && meta.roomId >= 0));
      const stop = assertNonNull(door.entries[door.roomIds.findIndex(x => x === dstRoomId)]);
      prePostEdges[0] = { key: 'room-edge', doorId: initDoorId, srcRoomId: null, dstRoomId, start: src, stop };
    }
    if (stopInDoorway) {
      console.log('WILL STOP IN DOORWAY', finalDoorId);
      const door = this.gm.doors[finalDoorId];
      // Final sub-nodePath should match finalDoorId and have valid roomId
      const metas = extantLast(nodePaths).map(x => this.nodeToMeta[x.index]);
      const { roomId: srcRoomId } = assertDefined(metas.find(meta => meta.doorId === finalDoorId && meta.roomId >= 0));
      const start = assertNonNull(door.entries[door.roomIds.findIndex(x => x === srcRoomId)]);
      prePostEdges[1] = { key: 'room-edge', doorId: finalDoorId, srcRoomId, dstRoomId: null, start, stop: dst };
    }

    const pulledPaths = nodePaths.map((subNodePath, pathId) => {

      const pathSrc = pathId === 0
        // 1st path might be preceded by a roomEdge
        ? prePostEdges[0] ? prePostEdges[0].stop : src
        : roomEdges[pathId - 1].stop;
        
      const pathDst = pathId === nodePaths.length - 1
        // Final path might be proceeded by a roomEdge
        ? prePostEdges[1] ? prePostEdges[1].start : dst
        // NOTE seen issue with global nav where this null
        : roomEdges[pathId].start;

      let roomId = pathId === 0 // See above for casts
        ? prePostEdges[0] ? /** @type {number} */ (prePostEdges[0].dstRoomId) : this.nodeToMeta[srcNode.index].roomId 
        : /** @type {number} */ (roomEdges[pathId - 1].dstRoomId);

      if (roomId === -1) {
        // NOTE hull doors handled in useGeomorphData, but src/dst could be in a doorway
        roomId = this.gm.roomsWithDoors.findIndex(x => x.outlineContains(pathSrc));
        warn(`floorGraphClass ${this.gm.key}: navNode ${srcNode.index} lacks associated roomId (using ${roomId})`);
      }

      // Can we simply walk straight through room `roomId`?
      const roomNavPoly = this.gm.lazy.roomNavPoly[roomId];
      const directPath = !geom.lineSegCrossesPolygon(pathSrc, pathDst, roomNavPoly);
      if (directPath) {
        return [Vect.from(pathSrc), Vect.from(pathDst)];
      }

      // Otherwise, use "simple stupid funnel algorithm"
      return /** @type {Geom.VectJson[]} */ (
        this.computeStringPull(pathSrc, pathDst, subNodePath).path
      ).map(Vect.from);

    });

    // Construct the alternating sequence
    const seq = /** @type {NPC.LocalNavPath['seq']} */ ([]);
    prePostEdges[0] && seq.push(prePostEdges[0]);
    pulledPaths.forEach((path, i) => {
      seq.push(path);
      roomEdges[i] && seq.push(roomEdges[i]);
    });
    prePostEdges[1] && seq.push(prePostEdges[1]);

    console.log({ seq, nodePaths, pulledPaths, roomEdges, nodePath, nodeMetas: nodePath.map(x => this.nodeToMeta[x.index]) }); // DEBUG
    this.cleanStringPull(seq);

    return {
      seq,
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

    const { groups: [navNodes], vertices } = zone;
    const graph = new floorGraphClass(gm);

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
