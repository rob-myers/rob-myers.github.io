import { Mat, Poly, Rect, Vect } from "../geom";
import { BaseGraph } from "./graph";
import { geom } from "../service/geom";
import { computeLightPosition, directionChars } from "../service/geomorph";
import { error } from "../service/log";

/**
 * `gmGraph` is short for _Geomorph Graph_
 * - _NOTE_ use lowercase __gmGraph__ to get (p)react-(p)refresh working!
 * @extends {BaseGraph<Graph.GmGraphNode, Graph.GmGraphEdgeOpts>}
 */
export class gmGraph extends BaseGraph {

  /** @type {Geomorph.GeomorphDataInstance[]}  */
  gms;

  /**
   * Technically, for each `key` we provide the last item of `gms` with this `key`.
   * All such items have the same underlying `Geomorph.GeomorphData`.
   * @readonly
   * @type {{ [gmKey in Geomorph.LayoutKey]?: Geomorph.GeomorphData }}
   */
  gmData;

  /**
   * World coordinates of entrypoint to hull door nodes.
   * @type {Map<Graph.GmGraphNodeDoor, Geom.Vect>}
   */
  entry;

  /** @param {Geomorph.GeomorphDataInstance[]} gms  */
  constructor(gms) {
    super();
    this.gms = gms;
    this.gmData = gms.reduce((agg, gm) => ({ ...agg, [gm.key]: gm }), {});
    this.entry = new Map;
  }

  /**
   * TODO 🚧 verify
   * Assume `transform` is non-singular and [±1, ±1, ±1, ±1, x, y]
   * @param {Geomorph.ConnectorRect<Poly, Vect, Rect>} hullDoor
   * @param {number} hullDoorId
   * @param {[number, number, number, number, number, number]} transform
   * @returns {null | Geom.Direction}
   */
  static computeHullDoorDirection(hullDoor, hullDoorId, transform) {
    const found = hullDoor.tags.find(x => /^hull\-[nesw]$/.test(x));
    if (found) {
      const dirChar = /** @type {typeof directionChars[*]} */ (found.slice(-1));
      const direction = /** @type {Geom.Direction} */ (directionChars.indexOf(dirChar));
      const ime1 = { x: transform[0], y: transform[1] };
      const ime2 = { x: transform[2], y: transform[3] };
      
      if (ime1.x === 1) {// (1, 0)
        if (ime2.y === 1) // (1, 0, 0, 1)
          return direction;
        if (ime2.y === -1) // (1, 0, 0, -1)
          return geom.getFlippedDirection(direction, 'x');
      } else if (ime1.y === 1) {// (0, 1)
        if (ime2.x === 1) // (0, 1, 1, 0)
          return geom.getFlippedDirection(geom.getDeltaDirection(direction, 2), 'y'); 
        if (ime1.x === -1) // (0, 1, -1, 0)
          return geom.getDeltaDirection(direction, 1);
      } else if (ime1.x === -1) {// (-1, 0)
        if (ime2.y === 1) // (-1, 0, 0, 1)
          return geom.getFlippedDirection(direction, 'y');
        if (ime2.y === -1) // (-1, 0, 0, -1)
          return geom.getDeltaDirection(direction, 2);
      } else if (ime1.y === -1) {// (0, -1)
        if (ime2.x === 1) // (0, -1, 1, 0)
          return geom.getDeltaDirection(direction, 3);
        if (ime2.x === -1) // (0, -1, -1, 0)
          return geom.getFlippedDirection(geom.getDeltaDirection(direction, 3), 'y');
      }
      error(`hullDoor ${hullDoorId}: ${found}: failed to parse transform "${transform}"`);
    } else {
      error(`hullDoor ${hullDoorId}: expected tag "hull-{n,e,s,w}" in hull door`);
    }
    return null;
  }

  /**
   * TODO 🚧 test
   * @param {Geom.VectJson} src
   * @param {Geom.VectJson} dst 
   */
  findPath(src, dst) {
    const srcGmId = this.gms.findIndex(x => x.gridRect.contains(src));
    const dstGmId = this.gms.findIndex(x => x.gridRect.contains(dst));
    if (srcGmId === -1 || dstGmId === -1) {
      return null;
    }
    
    const gmIdsPath = /** @type {NPC.GlobalNavItem[]} */ ([]);
    const currSrc = Vect.from(src);
    const direction = Vect.from(dst).sub(src);
    let gmId = srcGmId;

    while (gmId !== dstGmId) {
      const sides = geom.compassPoints(direction);
      const doorNodes = sides.flatMap(sideDir =>
        this.getConnectedDoorsBySide(gmId, sideDir)
      );

      const closest = doorNodes.reduce((agg, doorNode) => {
        const v = this.getDoorEntry(doorNode);
        const d = currSrc.distanceToSquared(v);
        if (!agg.node || d < agg.d) return { d, v, node: doorNode };
        return agg;
      }, /** @type {{ d: number; v: Vect; node?: Graph.GmGraphNodeDoor }} */ ({ d: Infinity, v: new Vect }));

      if (closest.node) {
        const adjDoorNode = this.getAdjacentDoor(closest.node);
        if (!adjDoorNode || adjDoorNode.gmIndex === gmId) {
          error(`global nav: ${gmId} ${closest.node.id} has no adjacent door`);
          return null;
        } // Update state
        gmIdsPath.push({
          src: { gmId, hullDoorId: closest.node.hullDoorId, exit: closest.v },
          dst: { gmId: adjDoorNode.gmIndex, hullDoorId: adjDoorNode.hullDoorId, entry: this.getDoorEntry(adjDoorNode) },
        });
        gmId = adjDoorNode.gmIndex;
        currSrc.copy(closest.v);
        direction.copy(dst).sub(currSrc);
      } else {
        error(`global nav: ${gmId} ${sides}: no closest node`);
        return null;
      }
    }

    return gmIdsPath;
  }

  /**
   * @param {Graph.GmGraphNode} node 
   */
  getAdjacentDoor(node) {
    const doorNode = this.getSuccs(node).find(x => x.type === 'door');
    return doorNode ? /** @type {Graph.GmGraphNodeDoor} */ (doorNode) : null
  }

  /**
   * Get door nodes connecting `gms[gmId]` on side `sideDir`.
   * @param {number} gmId 
   * @param {Geom.Direction} sideDir 
   */
  getConnectedDoorsBySide(gmId, sideDir) {
    const gmNode = /** @type {Graph.GmGraphNodeGm} */ (this.nodesArray[gmId]);
    const doorNodes = /** @type {Graph.GmGraphNodeDoor[]} */ (this.getSuccs(gmNode));
    return doorNodes.filter(x => !x.sealed && x.direction === sideDir);
  }

  /**
   * @param {number} gmId 
   * @param {number} hullDoorId 
   * @returns {{ adjGmId: number; adjRoomId: number; adjHullId: number; adjDoorId: number } | null}
   */
  getAdjacentRoomCtxt(gmId, hullDoorId) {
    const gm = this.gms[gmId];
    const gmNode = this.nodesArray[gmId];
    const doorNodeId = getGmDoorNodeId(gm.key, gm.transform, hullDoorId);
    const doorNode = this.getNodeById(doorNodeId);
    if (!doorNode) {
      console.error(`GmGraph: failed to find hull door node: ${doorNodeId}`);
      return null;
    }
    const otherDoorNode = /** @type {undefined | Graph.GmGraphNodeDoor} */ (this.getSuccs(doorNode).find(x => x !== gmNode));
    if (!otherDoorNode) {
      console.info(`GmGraph hull door: ${doorNodeId} on boundary`);
      return null;
    }
    // `door` is a hull door and connected to another
    // console.log({otherDoorNode});
    const { gmIndex: adjGmId, hullDoorId: dstHullDoorId, doorId: adjDoorId } = otherDoorNode;
    const { roomIds } = this.gms[adjGmId].hullDoors[dstHullDoorId];
    const adjRoomId = /** @type {number} */ (roomIds.find(x => typeof x === 'number'));
    return { adjGmId, adjRoomId, adjHullId: dstHullDoorId, adjDoorId };
  }

  /** @param {Graph.GmGraphNodeDoor} doorNode */
  getDoorEntry(doorNode) {
    return /** @type {Geom.Vect} */ (this.entry.get(doorNode));
  }
  
  /**
   * @param {string} nodeId 
   */
  getDoorNode(nodeId) {
    return /** @type {Graph.GmGraphNodeDoor} */ (this.getNodeById(nodeId));
  }

  /**
   * Get union of roomsWithDoors on either side of door.
   * In case of a hull door, we transform into other geomorph.
   * @param {number} gmId 
   * @param {number} doorId
   * @returns {null | { gmIndex: number; doorIndex: number; adjRoomId: null | number; poly: Geom.Poly }}
   */
  getOpenDoorArea(gmId, doorId) {
    const gm = this.gms[gmId];
    const door = gm.doors[doorId];
    const hullDoorId = gm.hullDoors.indexOf(door);
    if (hullDoorId === -1) {
      const adjRoomNodes = gm.roomGraph.getAdjacentRooms(gm.roomGraph.getDoorNode(doorId));
      const adjRooms = adjRoomNodes.map(x => gm.roomsWithDoors[x.roomId]);
      // const adjRoomsSansHoles = adjRoomNodes.map(x => new Poly(gm.roomsWithDoors[x.roomId].outline));
      return { gmIndex: gmId, doorIndex: doorId, adjRoomId: null, poly: Poly.union(adjRooms)[0] };
    }

    const result = this.getAdjacentRoomCtxt(gmId, hullDoorId);
    if (result) {
      const srcRoomId = /** @type {number} */ (door.roomIds.find(x => typeof x === 'number'));
      const otherGm = this.gms[result.adjGmId];
      const otherGmRoom = otherGm.roomsWithDoors[result.adjRoomId];
      // const otherGmRoomSansHoles = new Poly(otherGm.roomsWithDoors[result.adjRoomId].outline);
      const poly = Poly.union([// We transform poly from `gm` coords to `otherGm` coords
        gm.roomsWithDoors[srcRoomId].clone().applyMatrix(gm.matrix).applyMatrix(otherGm.inverseMatrix),
        otherGmRoom,
      ])[0];

      return { gmIndex: result.adjGmId, doorIndex: result.adjDoorId, adjRoomId: result.adjRoomId, poly };
    } else {
      console.error(`GmGraph: getOpenDoorArea: failed to get context`, { gmIndex: gmId, doorIndex: doorId, hullDoorIndex: hullDoorId });
      return null;
    }
  }

  /**
   * Get union of window with rooms on either side of window.
   * Currently windows cannot connect distinct geomorphs.
   * @param {number} gmId 
   * @param {number} windowId 
   */
  getOpenWindowPolygon(gmId, windowId) {
    const gm = this.gms[gmId];
    const window = gm.windows[windowId];
    const adjRoomNodes = gm.roomGraph.getAdjacentRooms(gm.roomGraph.getWindowNode(windowId));
    return Poly.union(adjRoomNodes.map(x => gm.rooms[x.roomId]).concat(window.poly))[0];
  }

  /**
   * @param {number} gmId 
   * @param {number} rootRoomId 
   * @param {number[]} openDoorIds 
   * @returns {{ gmIndex: number; poly: Poly }[]}
   */
  computeLightPolygons(gmId, rootRoomId, openDoorIds) {
    const gm = this.gms[gmId];
    const roomNode = gm.roomGraph.nodesArray[rootRoomId];

    const adjOpenDoorIds = gm.roomGraph.getAdjacentDoors(roomNode)
      .map(x => x.doorId).filter(id => openDoorIds.includes(id));
    const areas = adjOpenDoorIds
      .flatMap(doorId => this.getOpenDoorArea(gmId, doorId) || []);
    const doorLights = areas.map((area) => {
      const doors = this.gms[area.gmIndex].doors;
      // TODO restrict to fewer doors
      // Needed when 2 doors adjoin a single room e.g. double-doors
      const closedDoorSegs = doors.filter((_, id) => id !== area.doorIndex).map(x => x.seg);
      return {
        gmIndex: area.gmIndex,
        poly: geom.lightPolygon({// TODO avoid nullable `adjRoomId` (?)
          position: computeLightPosition(doors[area.doorIndex], area.adjRoomId??rootRoomId),
          range: 2000,
          exterior: area.poly,
          extraSegs: closedDoorSegs,
        }),
      };
    });
    
    const adjWindowIds = gm.roomGraph.getAdjacentWindows(roomNode)
    .filter(x => {
      const connector = gm.windows[x.windowIndex];
        // Frosted windows opaque
        if (connector.tags.includes('frosted')) return false;
        // One-way mirror
        if (connector.tags.includes('one-way') && connector.roomIds[0] !== rootRoomId) return false;
        return true;
      })
      .map(x => x.windowIndex);
    const windowLights = adjWindowIds.map(windowIndex => ({
      gmIndex: gmId,
      poly: geom.lightPolygon({
        position: computeLightPosition(gm.windows[windowIndex], rootRoomId),
        range: 1000,
        exterior: this.getOpenWindowPolygon(gmId, windowIndex),
      }),
    }));

    return [
      ...doorLights,
      ...windowLights,
    ];
  }

  /**
   * The only way a gmGraph is constructed.
   * @param {Geomorph.GeomorphDataInstance[]} gms 
   */
  static fromGms(gms) {
    const graph = new gmGraph(gms);

    /** @type {Graph.GmGraphNode[]} */
    const nodes = [
      // NOTE geomorph nodes are aligned to `gms` for easy access
      ...gms.map((x, gmIndex) => {
        /** @type {Graph.GmGraphNodeGm} */
        const gmNode = {
          type: 'gm',
          gmKey: x.key,
          gmIndex,
          id: getGmNodeId(x.key, x.transform),
          transform: x.transform,
        };
        return gmNode;        
      }),
      ...gms.flatMap(({ key: gmKey, hullDoors, transform, pngRect, doors }, gmIndex) =>
        hullDoors.map((hullDoor, hullDoorId) => {
          const alongNormal = hullDoor.poly.center.addScaledVector(hullDoor.normal, 20);
          const gmInFront = pngRect.contains(alongNormal);
          const direction = this.computeHullDoorDirection(hullDoor, hullDoorId, transform);

          /** @type {Graph.GmGraphNodeDoor} */
          const doorNode = {
            type: 'door',
            gmKey,
            gmIndex,
            id: getGmDoorNodeId(gmKey, transform, hullDoorId),
            doorId: doors.indexOf(hullDoor),
            hullDoorId,
            transform,
            gmInFront,
            direction,
            sealed: true, // Overwritten further below
          };
          return doorNode;
        })
      ),
    ];

    graph.registerNodes(nodes);
    // Compute `graph.entry`
    nodes.forEach(node => {
      if (node.type === 'door') {
        const { matrix, doors } = gms[node.gmIndex];
        const entry = /** @type {Geom.Vect} */ (doors[node.doorId].entries.find(Boolean));
        graph.entry.set(node, matrix.transformPoint(entry.clone()));
      }
    });

    // Each gm node is connected to its door nodes (hull doors it has)
    /** @type {Graph.GmGraphEdgeOpts[]} */
    const localEdges = gms.flatMap(({ key: gmKey, hullDoors, transform }) => {
      const gmNodeKey = getGmNodeId(gmKey, transform);
      return hullDoors.map((_, hullDoorIndex) => ({
        src: gmNodeKey,
        dst: getGmDoorNodeId(gmKey, transform, hullDoorIndex),
      }));
    });
    
    // Each door node is connected to the door node it is identified with (if any)
    const globalEdges = gms.flatMap((srcItem, gmId) => {
      /**
       * Detect geomorphs whose gridRects border current one.
       * NOTE wasting some computation because relation is symmetric
       */
      const adjItems = gms.filter((dstItem, dstGmId) => dstGmId !== gmId && dstItem.gridRect.intersects(srcItem.gridRect));
      // console.info('geomorph to geomorph:', srcItem, '-->', adjItems);
      /**
       * For each hull door, detect any intersection with aligned geomorph hull doors.
       * - We may assume every hull door is an axis-aligned rect.
       * - However, `door.rect` is an "angled rect" i.e. may need to have angle applied,
       *   or alteratively one can work with `door.poly` as we do below.
       */
      const [srcRect, dstRect] = [new Rect, new Rect];
      const [srcMatrix, dstMatrix] = [new Mat, new Mat];
      return srcItem.hullDoors.flatMap((srcDoor, hullDoorId) => {
        const srcDoorNodeId = getGmDoorNodeId(srcItem.key, srcItem.transform, hullDoorId);
        srcMatrix.setMatrixValue(srcItem.transform);
        srcRect.copy(srcDoor.poly.rect.applyMatrix(srcMatrix));

        const pairs = adjItems.flatMap(item => item.hullDoors.map(door => /** @type {const} */ ([item, door])));
        const matching = pairs.find(([{ transform }, { poly }]) => srcRect.intersects(dstRect.copy(poly.rect.applyMatrix(dstMatrix.setMatrixValue(transform)))));
        if (matching !== undefined) {
          const [dstItem, dstDoor] = matching;
          const dstHullDoorId = dstItem.hullDoors.indexOf(dstDoor);
          // console.info('hull door to hull door:', srcItem, hullDoorId, '==>', dstItem, dstHullDoorId)
          const dstDoorNodeId = getGmDoorNodeId(dstItem.key, dstItem.transform, dstHullDoorId);
          // NOTE door nodes with global edges are not sealed
          graph.getDoorNode(srcDoorNodeId).sealed = false;
          return { src: srcDoorNodeId, dst: dstDoorNodeId };
        } else {
          return [];
        }
      });
    });

    [...localEdges, ...globalEdges].forEach(({ src, dst }) => {
      if (src && dst) {
        graph.connect({ src, dst });
        graph.connect({ src: dst, dst: src });
      }
    });

    return graph;
  }
}

/**
 * @param {Geomorph.LayoutKey} gmKey 
 * @param {[number, number, number, number, number, number]} transform 
 */
function getGmNodeId(gmKey, transform) {
  return `gm-${gmKey}-[${transform}]`;
}

/**
 * @param {Geomorph.LayoutKey} gmKey 
 * @param {[number, number, number, number, number, number]} transform 
 * @param {number} hullDoorId 
 */
function getGmDoorNodeId(gmKey, transform, hullDoorId) {
  return `door-${gmKey}-[${transform}]-${hullDoorId}`;
}
