import { Mat, Poly, Rect } from "../geom";
import { BaseGraph } from "./graph";
import { geom } from "../service/geom";
import { computeLightPosition } from "../service/geomorph";

/**
 * `GmGraph` is short for _Geomorph Graph_
 * @extends {BaseGraph<Graph.GmGraphNode, Graph.GmGraphEdgeOpts>}
 */
export class GmGraph extends BaseGraph {
  /** @type {Geomorph.UseGeomorphsItem[]}  */
  gms;

  /** @param {Geomorph.UseGeomorphsItem[]} gms  */
  constructor(gms) {
    super();
    this.gms = gms;
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
   * Get union of holesWithDoors on either side of door,
   * including connected hull doors.
   * @param {number} gmIndex 
   * @param {number} doorIndex 
   */
  getOpenDoorPolygon(gmIndex, doorIndex) {
    const gm = this.gms[gmIndex];
    const door = gm.doors[doorIndex];
    const hullDoorIndex = gm.hullDoors.indexOf(door);
    if (hullDoorIndex === -1) {
      const adjRoomNodes = gm.roomGraph.getAdjacentRooms(gm.roomGraph.getDoorNode(doorIndex));
      return Poly.union(adjRoomNodes.map(x => gm.holesWithDoors[x.holeIndex]))[0];
    }

    const srcHoleId = /** @type {number} */ (door.holeIds.find(x => typeof x === 'number'));
    const result = this.getAdjacentHoleCtxt(gmIndex, hullDoorIndex);
    if (result) {
      return Poly.union([gm.holesWithDoors[srcHoleId], this.gms[result.adjGmId].holesWithDoors[result.adjHoleId]])[0];
    } else {
      console.error(`GmGraph: getAdjacentHoleCtxt: failed to get context`, { gmIndex, doorIndex, hullDoorIndex });
      return new Poly;
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
    return Poly.union(
      adjRoomNodes.map(x => gm.holesWithDoors[x.holeIndex]).concat(window.poly)
    )[0];
  }

  /**
   * TODO initially just repro LightsTest
   * @param {number} gmIndex 
   * @param {number} rootHoleId 
   * @param {number[]} openDoorIds 
   */
  computeLightPolygons(gmIndex, rootHoleId, openDoorIds) {
    const gm = this.gms[gmIndex];
    const roomNode = gm.roomGraph.nodesArray[rootHoleId];
    const adjOpenDoorIds = gm.roomGraph.getAdjacentDoors(roomNode).map(x => x.doorIndex).filter(id => openDoorIds.includes(id));
    // NOTE adjacent closed doors insufficient
    const closedDoorPolys = gm.doors.flatMap((door, id) => !adjOpenDoorIds.includes(id) ? door.poly : []);

    const doorLights = adjOpenDoorIds.map(doorIndex =>
      geom.lightPolygon(
        computeLightPosition(gm.doors[doorIndex], rootHoleId),
        1000,
        // TODO cache door triangulations earlier, or avoid triangles
        closedDoorPolys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate())),
        this.getOpenDoorPolygon(gmIndex, doorIndex),
      )
    );
    
    const adjWindowIds = gm.roomGraph.getAdjacentWindows(roomNode).map(x => x.windowIndex);
    const windowLights = adjWindowIds.map(windowIndex =>
      geom.lightPolygon(
        computeLightPosition(gm.windows[windowIndex], rootHoleId),
        1000,
        undefined,
        this.getOpenWindowPolygon(gmIndex, windowIndex),
      )
    );

    return [
      ...doorLights,
      ...windowLights,
    ];
  }

  /**
   * @param {Geomorph.UseGeomorphsItem[]} gms 
   */
  static fromGmItems(gms) {
    const graph = new GmGraph(gms);

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
      console.info('geomorph to geomorph:', srcItem, '-->', adjItems);
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
          console.info('hull door to hull door:', srcItem, hullDoorId, '==>', dstItem, dstHullDoorId)
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
