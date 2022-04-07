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
      ...gmItems.map(x => {
        /** @type {Graph.GmGraphNodeGm} */
        const gmNode = { type: 'gm', gmKey: x.gm.key, id: getGmNodeId(x.gm.key, x.transform), transform: x.transform  };
        return gmNode;        
      }),
      ...gmItems.flatMap(({ gm, transform }) => gm.d.hullDoors.map((hullDoor, hullDoorIndex) => {
        const alongNormal = hullDoor.poly.center.addScaledVector(hullDoor.normal, 20);
        // We are detecting whether moving along normal we stay inside geomorph
        const gmSign = gm.d.pngRect.contains(alongNormal) ? 1 : -1;
        /** @type {Graph.GmGraphNodeDoor} */
        const doorNode = { type: 'door', gmKey: gm.key, id: getDoorNodeId(gm.key, transform, hullDoorIndex), hullDoorIndex, transform, gmSign };
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
    const localEdges = gmItems.flatMap(({ gm, transform }) => {
      const gmNodeKey = getGmNodeId(gm.key, transform);
      return gm.d.hullDoors.map((_, hullDoorIndex) => ({
        src: gmNodeKey,
        dst: getDoorNodeId(gm.key, transform, hullDoorIndex),
      }));
    });
    
    // Each door node is connected to the door node it is identified with (if any)
    const globalEdges = gmItems.flatMap((srcItem, roomNodeId) => {
      // Detect geomorphs whose gridRects border current one
      const adjItems = gmItems.filter((otherItem, otherId) => otherId > roomNodeId && otherItem.gridRect.intersects(srcItem.gridRect));
      console.info('geomorph to geomorph:', srcItem, '-->', adjItems);

      // For each hull door, detect intersection with aligned geomorph doors
      // We must transform the respective geometry to check this
      const tmpRect = new Rect;
      return srcItem.gm.d.hullDoors.flatMap((srcDoor, hullDoorIndex) => {
        const srcDoorNodeId = getDoorNodeId(srcItem.gm.key, srcItem.transform, hullDoorIndex);
        const matrix = new Mat(srcItem.transform);
        const srcRect = Rect.fromJson(srcDoor.rect).applyMatrix(matrix);
        const pairs = adjItems.flatMap(item => item.gm.d.hullDoors.map(door => /** @type {const} */ ([item, door])));
        const matching = pairs.find(([_item, { rect: otherRect }]) => srcRect.intersects(tmpRect.setFromJson(otherRect).applyMatrix(matrix)));
        if (matching !== undefined) {
          const [dstItem, dstDoor] = matching;
          const dstHullDoorIndex = dstItem.gm.d.hullDoors.indexOf(dstDoor);
          console.info('hull door to hull door:', srcItem, hullDoorIndex, '==>', dstItem, dstItem.gm.d.hullDoors.indexOf(dstDoor))
          const dstDoorNodeId = getDoorNodeId(dstItem.gm.key, dstItem.transform, dstHullDoorIndex);
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
function getDoorNodeId(gmKey, transform, hullDoorId) {
  return `door-${gmKey}-[${transform}]-${hullDoorId}`;
}
