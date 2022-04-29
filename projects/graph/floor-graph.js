import { Vect } from "../geom";
import { BaseGraph } from "./graph";
import { Utils } from "../pathfinding/Utils";
import { AStar } from "../pathfinding/AStar";
import { Channel } from "../pathfinding/Channel";
import { geom } from "../service/geom";

/**
 * @extends {BaseGraph<Graph.FloorGraphNode, Graph.FloorGraphEdgeOpts>}
 */
export class FloorGraph extends BaseGraph {

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
   * Based on https://github.com/donmccurdy/three-pathfinding/blob/ca62716aa26d78ad8641d6cebb393de49dd70e21/src/Pathfinding.js#L106
   * @param {Geom.VectJson} src in geomorph local coords
   * @param {Geom.VectJson} dst in geomorph local coords
   */
  findPath(src, dst) {
    const closestNode = this.getClosestNode(src);
    const farthestNode = this.getClosestNode(dst);
    if (!closestNode || !farthestNode) {
      return null; // We can't find any node
    }

    const nodePath = AStar.search(this, closestNode, farthestNode);
    if (nodePath.length === 0 && closestNode === farthestNode) {
      // Ensure a non-empty nodePath when src and dst in same triangle
      nodePath.push(closestNode);
    }

    // One fewer than `nodePaths`
    const transitions = /** @type {NPC.LocalNavItem[]} */ ([]);
    // Split path by door nodes
    const nodePaths = nodePath.reduce((agg, node) => {
      const meta = this.nodeToMeta[node.index];
      if (meta.doorId === -1) {
        agg.length ? agg[agg.length - 1].push(node) : agg.push([node]);
      } else {
        const lastSeen = transitions[transitions.length - 1];
        if (!lastSeen || lastSeen.doorId !== meta.doorId) {// lastSeen undefined or new meta.doorId
          agg.push([]);
          const door = this.gm.doors[meta.doorId];
          const entry = /** @type {Geom.Vect} */ (door.roomIds[0] === meta.roomId ? door.entries[0] : door.entries[1]);
          transitions.push({
            doorId: meta.doorId,
            srcRoomId: meta.roomId,
            dstRoomId: meta.roomId,
            entry,
            exit: entry,
          });
        } else if (meta.doorId === lastSeen.doorId && meta.roomId !== lastSeen.dstRoomId) {
          lastSeen.dstRoomId = meta.roomId; // Should overwrite on exit door
          const door = this.gm.doors[meta.doorId];
          lastSeen.exit = /** @type {Geom.Vect} */ (door.roomIds[0] === meta.roomId ? door.entries[0] : door.entries[1]);
        }
      }
      return agg;
    }, /** @type {Graph.FloorGraphNode[][]} */ ([]));

    if (nodePaths[nodePaths.length - 1]?.length === 0)
      nodePaths.pop(); // Fix trailing empty array when end at doorway
    
    console.log({ nodePaths, transitions });

    const pulledPaths = nodePaths.map((nodePath, pathId) => {
      // const pathSrc = pathId === 0 ? src : nodePath[0].centroid;
      // const pathDst = pathId === nodePaths.length - 1 ? dst : nodePath[nodePath.length - 1].centroid;
      const pathSrc = pathId === 0 ? src : transitions[pathId - 1].exit;
      const pathDst = pathId === nodePaths.length - 1 ? dst : transitions[pathId].entry;

      // TODO fix cases where roomNavPoly.length > 1
      const roomId = pathId === 0 ? this.nodeToMeta[closestNode.index].roomId : transitions[pathId - 1].dstRoomId;
      const roomNavPoly = this.gm.lazy.roomNavPoly[roomId];
      const directPath = !geom.lineSegCrossesPolygon(pathSrc, pathDst, roomNavPoly[0]);
      if (directPath) return [Vect.from(pathSrc), Vect.from(pathDst)];

      // Apply "simple stupid funnel algorithm"
      const path = /** @type {Geom.VectJson[]} */ (this.computeStringPull(pathSrc, pathDst, nodePath).path);
      return path.map(Vect.from);
    });

    // Omit 1st point and discard adjacent repetitions
    // TODO why repetitions?
    const normalisedPaths = pulledPaths.map((pulledPath, i) => {
      return (
        i ? pulledPath : pulledPath.slice(1)
      ).reduce((agg, p) =>
        agg.length && p.equals(agg[agg.length - 1]) ? agg : agg.concat(p)
      , /** @type {Geom.Vect[]} */ ([]));
    });

    return { normalisedPaths, nodePaths, nodePathMetas: transitions }
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
    const graph = new FloorGraph(gm);

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
