import { Rect } from "../geom";
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
      // NOTE room nodes aligned to `gmItems`
      ...gmItems.map(x => {
        /** @type {Graph.GmGraphNodeGm} */
        const gmNode = { type: 'gm', gmKey: x.layoutKey, id: `gm-${x.layoutKey}-[${x.transform}]`, transform: x.transform  };
        return gmNode;        
      }),
      ...gmItems.flatMap(x => x.hullDoors.map((_, hullDoorIndex) => {
        /** @type {Graph.GmGraphNodeDoor} */
        const doorNode = { type: 'door', gmKey: x.layoutKey, id: `door-${x.layoutKey}-[${x.transform}]-${hullDoorIndex}`, hullDoorIndex, transform: x.transform };
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
    const localEdges = gmItems.flatMap(x => {
      const gmNodeKey = `gm-${x.layoutKey}-[${x.transform}]`;
      return x.hullDoors.map((y, hullDoorIndex) => ({
        src: gmNodeKey,
        dst: `door-${x.layoutKey}-[${x.transform}]-${hullDoorIndex}`,
      }));
    });

    // Each door node is connected to the door node it is identified with (if any)
    const globalEdges = gmItems.flatMap((srcItem, roomNodeId) => {
      // Detect geomorphs which border with `x`
      const adjItems = gmItems.filter((y, otherId) => otherId > roomNodeId && y.pngRect.intersects(srcItem.pngRect));
      console.info('geomorph to geomorph:', srcItem, '-->', adjItems);

      // For each hull door, detect if intersects ones from aligned geomorphs
      return srcItem.hullDoors.flatMap((srcDoor, hullDoorIndex) => {
        const srcDoorNodeId = `door-${srcItem.layoutKey}-[${srcItem.transform}]-${hullDoorIndex}`;
        const srcRect = Rect.fromJson(srcDoor.rect);
        const tmpRect = new Rect;
        const pairs = adjItems.flatMap(item => item.hullDoors.map(door => /** @type {const} */ ([item, door])));
        const matching = pairs.find(([_item, { rect: otherRect }]) => srcRect.intersects(tmpRect.setFromJson(otherRect)));
        if (matching !== undefined) {
          const [dstItem, dstDoor] = matching;
          const dstHullDoorIndex = dstItem.hullDoors.indexOf(dstDoor);
          console.info('hull door to hull door:', srcItem, hullDoorIndex, '==>', dstItem, dstItem.hullDoors.indexOf(dstDoor))
          const dstDoorNodeId = `door-${dstItem.layoutKey}-[${dstItem.transform}]-${dstHullDoorIndex}`;
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
