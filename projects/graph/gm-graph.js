import { Mat, Rect } from "../geom";
import { BaseGraph } from "./graph";

/**
 * GmGraph is short for _Geomorph Graph_
 * @extends {BaseGraph<Graph.GmGraphNode, Graph.GmGraphEdgeOpts>}
 */
export class GmGraph extends BaseGraph {

  /**
   * @param {Geomorph.UseGeomorphsItem[]} gmItems 
   */
  static fromGmItems(gmItems) {
    const graph = new GmGraph;

    /** @type {Graph.GmGraphNode[]} */
    const nodes = [
      // NOTE geomorph nodes aligned to `gmItems`
      ...gmItems.map((x, gmIndex) => {
        /** @type {Graph.GmGraphNodeGm} */
        const gmNode = { type: 'gm', gmKey: x.key, gmIndex, id: getGmNodeId(x.key, x.transform), transform: x.transform  };
        return gmNode;        
      }),
      ...gmItems.flatMap(({ key: gmKey, hullDoors, transform, pngRect }, gmIndex) => hullDoors.map((hullDoor, hullDoorIndex) => {
        const alongNormal = hullDoor.poly.center.addScaledVector(hullDoor.normal, 20);
        const gmInFront = pngRect.contains(alongNormal);
        /** @type {Graph.GmGraphNodeDoor} */
        const doorNode = { type: 'door', gmKey, gmIndex, id: getGmDoorNodeId(gmKey, transform, hullDoorIndex), hullDoorIndex, transform, gmInFront };
        return doorNode;
      })
      ),
    ];

    graph.registerNodes(nodes);

    // TODO edges
    // - specify edges exactly e.g. what about identified doors?
    // - detect when doors identified by
    //   - detecting aligned sides
    //   - doing rect intersect tests

    // Each gm node is connected to its door nodes (hull doors it has)
    /** @type {Graph.GmGraphEdgeOpts[]} */
    const localEdges = gmItems.flatMap(({ key: gmKey, hullDoors, transform }) => {
      const gmNodeKey = getGmNodeId(gmKey, transform);
      return hullDoors.map((_, hullDoorIndex) => ({
        src: gmNodeKey,
        dst: getGmDoorNodeId(gmKey, transform, hullDoorIndex),
      }));
    });
    
    // Each door node is connected to the door node it is identified with (if any)
    const globalEdges = gmItems.flatMap((srcItem, roomNodeId) => {
      // Detect geomorphs whose gridRects border current one
      const adjItems = gmItems.filter((otherItem, otherId) => otherId > roomNodeId && otherItem.gridRect.intersects(srcItem.gridRect));
      console.info('geomorph to geomorph:', srcItem, '-->', adjItems);

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
          console.info('hull door to hull door:', srcItem, hullDoorId, '==>', dstItem, dstItem.hullDoors.indexOf(dstDoor))
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
export function getGmNodeId(gmKey, transform) {
  return `gm-${gmKey}-[${transform}]`;
}

/**
 * @param {Geomorph.LayoutKey} gmKey 
 * @param {[number, number, number, number, number, number]} transform 
 * @param {number} hullDoorId 
 */
export function getGmDoorNodeId(gmKey, transform, hullDoorId) {
  return `door-${gmKey}-[${transform}]-${hullDoorId}`;
}
