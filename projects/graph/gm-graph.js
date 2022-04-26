import { Mat, Poly, Rect, Vect } from "../geom";
import { BaseGraph } from "./graph";
import { geom } from "../service/geom";
import { computeLightPosition, directionChars } from "../service/geomorph";
import { error } from "../service/log";

/**
 * `gmGraph` is short for _Geomorph Graph_
 * - _NOTE_ use lowercase __gmGraph__ to get react-refresh working!
 * @extends {BaseGraph<Graph.GmGraphNode, Graph.GmGraphEdgeOpts>}
 */
export class gmGraph extends BaseGraph {

  /** @type {Geomorph.GeomorphDataInstance[]}  */
  gms;

  /**
   * Actually `gms` keyed by LayoutKey i.e. last instance.
   * @readonly
   * @type {{ [gmKey in Geomorph.LayoutKey]?: Geomorph.GeomorphData }}
   */
  gmDataLookup;

  /** @param {Geomorph.GeomorphDataInstance[]} gms  */
  constructor(gms) {
    super();
    this.gms = gms;
    this.gmDataLookup = gms.reduce((agg, gm) => ({ ...agg, [gm.key]: gm }), {});
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
   * @param {Geom.VectJson} src
   * @param {Geom.VectJson} dst 
   */
  findPath(src, dst) {
    let gmId = this.gms.findIndex(x => x.gridRect.contains(src));
    const dstGmId = this.gms.findIndex(x => x.gridRect.contains(dst));
    const direction = Vect.from(dst).sub(src);
    
    while (gmId !== dstGmId) {
      const sides = geom.compassPoints(direction);
      // TODO 🚧 given "gm instance" how do we know which sides are connected?
      break;
    }

    // console.log({ srcGmId, dstGmId, compassPnts })
  }

  /**
   * @param {number} gmId 
   * @param {number} hullDoorId 
   * @returns {{ adjGmId: number; adjHoleId: number; adjHullId: number; adjDoorId: number } | null}
   */
  getAdjacentHoleCtxt(gmId, hullDoorId) {
    const gm = this.gms[gmId];
    const gmNode = this.getNodeById(getGmNodeId(gm.key, gm.transform));
    const doorNode = this.getNodeById(getGmDoorNodeId(gm.key, gm.transform, hullDoorId));
    if (!doorNode) {
      console.warn(`GmGraph: failed to find hull door node: ${getGmDoorNodeId(gm.key, gm.transform, hullDoorId)}`);
      return null;
    }
    const otherDoorNode = /** @type {undefined | Graph.GmGraphNodeDoor} */ (this.getSuccs(doorNode).filter(x => x !== gmNode)[0]);
    if (!otherDoorNode) {
      console.info('GmGraph: hull door on boundary', doorNode);
      return null;
    }
    // `door` is a hull door and connected to another
    // console.log({otherDoorNode});
    const { gmIndex: adjGmId, hullDoorId: dstHullDoorId, doorId: adjDoorId } = otherDoorNode;
    const { holeIds } = this.gms[adjGmId].hullDoors[dstHullDoorId];
    const adjHoleId = /** @type {number} */ (holeIds.find(x => typeof x === 'number'));
    return { adjGmId, adjHoleId, adjHullId: dstHullDoorId, adjDoorId };
  }

  /**
   * Get union of holesWithDoors on either side of door.
   * In case of a hull door, we transform into other geomorph.
   * @param {number} gmIndex 
   * @param {number} doorIndex
   * @returns {null | { gmIndex: number; doorIndex: number; adjHoleId: null | number; poly: Geom.Poly }}
   */
  getOpenDoorArea(gmIndex, doorIndex) {
    const gm = this.gms[gmIndex];
    const door = gm.doors[doorIndex];
    const hullDoorIndex = gm.hullDoors.indexOf(door);
    if (hullDoorIndex === -1) {
      const adjRoomNodes = gm.roomGraph.getAdjacentRooms(gm.roomGraph.getDoorNode(doorIndex));
      return { gmIndex, doorIndex, adjHoleId: null, poly: Poly.union(adjRoomNodes.map(x => gm.holesWithDoors[x.holeIndex]))[0]};
    }

    const result = this.getAdjacentHoleCtxt(gmIndex, hullDoorIndex);
    if (result) {
      const srcHoleId = /** @type {number} */ (door.holeIds.find(x => typeof x === 'number'));
      const otherGm = this.gms[result.adjGmId];
      const poly = Poly.union([// We transform poly from `gm` coords to `otherGm` coords
        gm.holesWithDoors[srcHoleId].clone().applyMatrix(gm.matrix).applyMatrix(otherGm.inverseMatrix),
        otherGm.holesWithDoors[result.adjHoleId],
      ])[0];

      return { gmIndex: result.adjGmId, doorIndex: result.adjDoorId, adjHoleId: result.adjHoleId, poly };
    } else {
      console.error(`GmGraph: getOpenDoorArea: failed to get context`, { gmIndex, doorIndex, hullDoorIndex });
      return null;
    }
  }

  /**
   * Get union of holesWithDoors on either side of windows.
   * Currently windows cannot connect distinct geomorphs.
   * @param {number} gmIndex 
   * @param {number} windowIndex 
   */
  getOpenWindowPolygon(gmIndex, windowIndex) {
    const gm = this.gms[gmIndex];
    const window = gm.windows[windowIndex];
    const adjRoomNodes = gm.roomGraph.getAdjacentRooms(gm.roomGraph.getWindowNode(windowIndex));
    return Poly.union(adjRoomNodes.map(x => gm.holes[x.holeIndex]).concat(window.poly))[0];
  }

  /**
   * @param {number} gmIndex 
   * @param {number} rootHoleId 
   * @param {number[]} openDoorIds 
   * @returns {{ gmIndex: number; poly: Poly }[]}
   */
  computeLightPolygons(gmIndex, rootHoleId, openDoorIds) {
    const gm = this.gms[gmIndex];
    const roomNode = gm.roomGraph.nodesArray[rootHoleId];

    const adjOpenDoorIds = gm.roomGraph.getAdjacentDoors(roomNode).map(x => x.doorIndex).filter(id => openDoorIds.includes(id));
    const areas = adjOpenDoorIds.flatMap(doorIndex => this.getOpenDoorArea(gmIndex, doorIndex) || []);
    const doorLights = areas.map((area) => {
      const doors = this.gms[area.gmIndex].doors;
      // NOTE needed e.g. when two doors adjoin a single hole
      // TODO restrict to doors adjacent to dst hole
      const closedDoorSegs = doors.filter((_, id) => id !== area.doorIndex).map(x => x.seg);
      return {
        gmIndex: area.gmIndex,
        poly: geom.lightPolygon({
          // TODO avoid nullable `adjHoleId`
          position: computeLightPosition(doors[area.doorIndex], area.adjHoleId??rootHoleId),
          range: 1000,
          exterior: area.poly,
          extraSegs: closedDoorSegs,
        }),
      };
    });
    
    const adjWindowIds = gm.roomGraph.getAdjacentWindows(roomNode).map(x => x.windowIndex);
    // const windowLights = adjWindowIds.map(windowIndex => ({
    //   gmIndex,
    //   poly: this.getOpenWindowPolygon(gmIndex, windowIndex),
    // }));
    const windowLights = adjWindowIds.map(windowIndex => ({
      gmIndex,
      poly: geom.lightPolygon({
        position: computeLightPosition(gm.windows[windowIndex], rootHoleId),
        range: 1000,
        exterior: this.getOpenWindowPolygon(gmIndex, windowIndex),
      }),
    }));

    return [
      ...doorLights,
      ...windowLights,
    ];
  }

  /**
   * @param {Geomorph.GeomorphDataInstance[]} gms 
   */
  static fromGms(gms) {
    const graph = new gmGraph(gms);

    /** @type {Graph.GmGraphNode[]} */
    const nodes = [
      // NOTE geomorph nodes aligned to `gmItems`
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
      ...gms.flatMap(({ key: gmKey, hullDoors, transform, pngRect, doors }, gmIndex) => hullDoors.map((hullDoor, hullDoorId) => {
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
        };
        return doorNode;
      })
      ),
    ];

    graph.registerNodes(nodes);

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
