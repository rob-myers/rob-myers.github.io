import { Vect } from "../geom";
import { BaseGraph } from "./graph";
import { Utils } from "../pathfinding/Utils";
import { AStar } from "../pathfinding/AStar";
import { Channel } from "../pathfinding/Channel";
import { warn } from "../service/log";
import { geom } from "../service/geom";

/**
 * @extends {BaseGraph<Graph.FloorGraphNode, Graph.FloorGraphEdgeOpts>}
 */
export class floorGraph extends BaseGraph {

  /** @type {Geomorph.GeomorphData} */
  gm;
  /** @type {Geom.Vect[]} */
  vectors;
  /**
   * Inverse of `doorNodeIds` and `roomToNodeIds`.
   * - We assume no nav node touches > 1 door.
   * - We assume no triangle resides in > 1 room.
   * @type {Record<number, { doorId: number; roomId: number }>}
   */
  nodeToMeta;

  /**
   * @param {Geomorph.GeomorphData} gm 
   */
  constructor(gm) {
    super();

    this.gm = gm;
    this.vectors = gm.navZone.vertices.map(Vect.from);

    // Compute `this.nodeToMeta`
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
   * Mutates `pulledPaths`
   * @param {Geom.Vect[][]} pulledPaths 
   * @param {NPC.NavRoomTransition[]} roomEdges
   */
  cleanStringPull(pulledPaths, roomEdges) {
    for (const [pathId, path] of pulledPaths.entries()) {
      // Ensure 2nd point not inside doorway
      let roomEdge = roomEdges[pathId - 1];
      if (roomEdge) {
        const door = this.gm.doors[roomEdge.doorId];
        if (door.rect.contains(path[1])) path.splice(1, 1);
      }
      // Ensure penultimate point not inside doorway
      roomEdge = roomEdges[pathId];
      if (roomEdge && path.length >= 2) {
        const door = this.gm.doors[roomEdge.doorId];
        if (door.rect.contains(path[path.length - 2])) path.splice(path.length - 2, 1);
      }

      // Avoid duplicate adjacent vertices (they can happen)
      pulledPaths[pathId] = geom.removePathReps(path);
    }
  }

  /**
   * Based on https://github.com/donmccurdy/three-pathfinding/blob/ca62716aa26d78ad8641d6cebb393de49dd70e21/src/Pathfinding.js#L106
   * @param {Geom.VectJson} src in geomorph local coords
   * @param {Geom.VectJson} dst in geomorph local coords
   */
  findPath(src, dst) {
    const closestNode = this.getClosestNode(src);
    const farthestNode = this.getClosestNode(dst);
    if (!closestNode || !farthestNode) {
      return null;
    }

    const nodePath = AStar.search(this, closestNode, farthestNode);
    if (nodePath.length === 0 && closestNode === farthestNode) {
      // Ensure a non-empty nodePath when src and dst in same triangle
      nodePath.push(closestNode);
    }

    /**
     * `nodePath` split by the room they reside in
     * - First path may not reside in any room (initial doorway)
     * - Final path may include part outside room (final doorway)
     */
    const nodePaths = /** @type {Graph.FloorGraphNode[][]} */ ([]);
    /** Currently always one fewer than nodePaths */
    const roomEdges = /** @type {NPC.NavRoomTransition[]} */ ([]);
    /**
     * This is updated along `nodePath` whenever we see new valid roomId.
     * @type {{ doorId: number; roomId: number }}
     */
    let prevMeta = this.nodeToMeta[nodePath[0].index];
    nodePath.forEach((node) => {
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
        const newDoor = this.gm.doors[meta.doorId];
        const points = /** @type {[Geom.Vect, Geom.Vect]} */ (newDoor.entries);
        roomEdges.push({
          doorId: meta.doorId,
          srcRoomId: prevMeta.roomId,
          dstRoomId: meta.roomId,
          // TODO what if `src` was in doorway?
          entry: newDoor.roomIds[0] === prevMeta.roomId ? points[0] : points[1],
          exit: newDoor.roomIds[0] === meta.roomId ? points[0] : points[1],
        });
        prevMeta = meta;
      }
    });

    const pulledPaths = nodePaths.map((nodePath, pathId) => {
      const pathSrc = pathId === 0 ? src : roomEdges[pathId - 1].exit;
      const pathDst = pathId === nodePaths.length - 1 ? dst : roomEdges[pathId].entry;

      let roomId = pathId === 0 ? this.nodeToMeta[closestNode.index].roomId : roomEdges[pathId - 1].dstRoomId;
      if (roomId === -1) {
        // NOTE hull doors handled in useGeomorphData, but src/dst could be in a doorway
        roomId = this.gm.roomsWithDoors.findIndex(x => x.outlineContains(pathSrc));
        warn(`floorGraph ${this.gm.key}: navNode ${closestNode.index} lacks associated roomId (using ${roomId})`);
      }

      // Can we simply walk straight through room `roomId`?
      const roomNavPoly = this.gm.lazy.roomNavPoly[roomId];
      const directPath = !geom.lineSegCrossesPolygon(pathSrc, pathDst, roomNavPoly);
      if (directPath) {
        return [Vect.from(pathSrc), Vect.from(pathDst)];
      }

      // Otherwise, use "simple stupid funnel algorithm"
      return /** @type {Geom.VectJson[]} */ (
        this.computeStringPull(pathSrc, pathDst, nodePath).path
      ).map(Vect.from);

    });

    this.cleanStringPull(pulledPaths, roomEdges);
    console.log({ pulledPaths, roomEdges }); // DEBUG

    // const firstNavMeta = nodePath.length ? this.nodeToMeta[nodePath[0].index] : null;
    // const finalNavMeta = nodePath.length ? this.nodeToMeta[nodePath[nodePath.length - 1].index] : null;

    return {
      /**
       * TODO cleaner approach i.e. alternating sequence 🚧
       * - [pulledPath, roomEdge, pulledPath, ...] or
       * - [roomEdge, pulledPath, roomEdge, ...]
       * - 1st pulledPath or roomEdge can start from src
       * - last pulledPath or roomEdge can end at dst
       */
      paths: pulledPaths,
      edges: roomEdges,
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
    const graph = new floorGraph(gm);

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
