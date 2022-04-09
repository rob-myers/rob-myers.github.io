import { Mat, Rect } from "../geom";
import { BaseGraph } from "./graph";

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
   * @returns {null | { adjGmId: number; holeId: number; adjHullId: number }}
   */
  getAdjacentPair(gmId, hullDoorId) {
    const gm = this.gms[gmId];
    const gmNode = this.getNodeById(getGmNodeId(gm.key, gm.transform));
    const doorNode = this.getNodeById(getGmDoorNodeId(gm.key, gm.transform, hullDoorId));
    if (!doorNode) {
      console.warn(`GmGraph: failed to find hull door node: ${getGmDoorNodeId(gm.key, gm.transform, hullDoorId)}`);
      return null;
    }
    const [otherDoorNode] = this.getSuccs(doorNode).filter(x => x !== gmNode);
    if (!otherDoorNode) {
      console.info('GmGraph: hull door on boundary', doorNode);
      return null;
    }
    // `door` is a hull door and connected to another
    // console.log({otherDoorNode});
    const { gmIndex: adjGmId, hullDoorId: dstHullDoorId } = /** @type {Graph.GmGraphNodeDoor} */ (otherDoorNode);
    const { holeIds } = this.gms[adjGmId].hullDoors[dstHullDoorId];
    const holeId = /** @type {number} */ (holeIds.find(x => typeof x === 'number'));
    return { adjGmId, holeId, adjHullId: /** @type {Graph.GmGraphNodeDoor} */ (otherDoorNode).hullDoorId };
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
        const gmNode = { type: 'gm', gmKey: x.key, gmIndex, id: getGmNodeId(x.key, x.transform), transform: x.transform  };
        return gmNode;        
      }),
      ...gms.flatMap(({ key: gmKey, hullDoors, transform, pngRect }, gmIndex) => hullDoors.map((hullDoor, hullDoorId) => {
        const alongNormal = hullDoor.poly.center.addScaledVector(hullDoor.normal, 20);
        const gmInFront = pngRect.contains(alongNormal);
        /** @type {Graph.GmGraphNodeDoor} */
        const doorNode = { type: 'door', gmKey, gmIndex, id: getGmDoorNodeId(gmKey, transform, hullDoorId), hullDoorId, transform, gmInFront };
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
    const globalEdges = gms.flatMap((srcItem, roomNodeId) => {
      // Detect geomorphs whose gridRects border current one
      const adjItems = gms.filter((otherItem, otherId) => otherId > roomNodeId && otherItem.gridRect.intersects(srcItem.gridRect));
      // console.info('geomorph to geomorph:', srcItem, '-->', adjItems);

      // For each hull door, detect intersection with aligned geomorph doors
      // We must transform the respective geometry to check this
      const [srcRect, dstRect] = [new Rect, new Rect];
      const [srcMatrix, dstMatrix] = [new Mat, new Mat];
      return srcItem.hullDoors.flatMap((srcDoor, hullDoorId) => {
        const srcDoorNodeId = getGmDoorNodeId(srcItem.key, srcItem.transform, hullDoorId);
        srcMatrix.setMatrixValue(srcItem.transform);
        srcRect.copy(srcDoor.rect).applyMatrix(srcMatrix);
        const pairs = adjItems.flatMap(item => item.hullDoors.map(door => /** @type {const} */ ([item, door])));
        const matching = pairs.find(([{ transform }, { rect: otherRect }]) => srcRect.intersects(dstRect.copy(otherRect).applyMatrix(dstMatrix.setMatrixValue(transform))));
        if (matching !== undefined) {
          const [dstItem, dstDoor] = matching;
          const dstHullDoorId = dstItem.hullDoors.indexOf(dstDoor);
          // console.info('hull door to hull door:', srcItem, hullDoorId, '==>', dstItem, dstItem.hullDoors.indexOf(dstDoor))
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
