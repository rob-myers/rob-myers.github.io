import { BinaryHeap } from './BinaryHeap';
import { Utils } from './Utils';

export class AStar {

  /** @param {Graph.FloorGraph} graph  */
  static init (graph) {
    const nodes = graph.nodesArray;
    for (let x = 0; x < nodes.length; x++) {
      //for(var x in graph) {
      const node = nodes[x];
      node.f = 0;
      node.g = 0;
      node.h = 0;
      node.cost = 1.0;
      node.visited = false;
      node.closed = false;
      node.parent = null;
    }
  }

  /** @param {Graph.FloorGraphNode[]} graph */
  static cleanUp (graph) {
    for (let x = 0; x < graph.length; x++) {
      const node = /** @type {Partial<Graph.FloorGraphNode>} */ (graph[x]);
      delete node.f;
      delete node.g;
      delete node.h;
      delete node.cost;
      delete node.visited;
      delete node.closed;
      delete node.parent;
    }
  }

  static heap () {
    return new BinaryHeap(
      /** @param {Graph.FloorGraphNode} node */
      function (node) {
        return /** @type {number} */ (node.f);
      }
    );
  }

  /**
   * @param {Graph.FloorGraph} graph 
   * @param {Graph.FloorGraphNode} start 
   * @param {Graph.FloorGraphNode} end 
   */
  static search (graph, start, end) {
    this.init(graph);
    //heuristic = heuristic || astar.manhattan;
    const nodes = graph.nodesArray;

    const openHeap = this.heap();
    openHeap.push(start);

    while (openHeap.size() > 0) {

      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      const currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path.
      if (currentNode === end) {
        let curr = currentNode;
        const result = [];
        while (curr.parent) {
          result.push(curr);
          curr = curr.parent;
        }
        result.push(start); // We include start
        this.cleanUp(result);
        result.reverse();
        return result;
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbours.
      currentNode.closed = true;

      // Find all neighbours for the current node. Optionally find diagonal neighbours as well (false by default).
      const neighbours = this.neighbours(nodes, currentNode);

      for (let i = 0, il = neighbours.length; i < il; i++) {
        const neighbour = neighbours[i];

        if (neighbour.closed) {
          // Not a valid node to process, skip to next neighbour.
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbour is the shortest one we have seen yet.
        const gScore = /** @type {number} */ (currentNode.g) + neighbour.cost;
        const beenVisited = neighbour.visited;

        if (!beenVisited || gScore < /** @type {number} */ (neighbour.g)) {

          // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
          neighbour.visited = true;
          neighbour.parent = currentNode;
          if (!neighbour.centroid || !end.centroid) throw new Error('Unexpected state');
          neighbour.h = neighbour.h || this.heuristic(neighbour.centroid, end.centroid);
          neighbour.g = gScore;
          neighbour.f = neighbour.g + neighbour.h;

          if (!beenVisited) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            openHeap.push(neighbour);
          } else {
            // Already seen the node, but since it has been rescored we need to reorder it in the heap
            openHeap.rescoreElement(neighbour);
          }
        }
      }
    }

    // No result was found - empty array signifies failure to find path.
    return [];
  }

  /**
   * @param {Geom.VectJson} pos1 
   * @param {Geom.VectJson} pos2 
   */
  static heuristic (pos1, pos2) {
    return Utils.distanceToSquared(pos1, pos2);
  }

  /**
   * @param {Graph.FloorGraphNode[]} graph 
   * @param {Graph.FloorGraphNode} node 
   */
  static neighbours (graph, node) {
    const ret = [];
    for (let e = 0; e < node.neighbours.length; e++) {
      ret.push(graph[node.neighbours[e]]);
    }
    return ret;
  }
}
