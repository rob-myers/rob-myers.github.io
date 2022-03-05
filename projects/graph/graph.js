import { deepClone, flatten, removeFirst } from "../service/generic";

/**
 * @template {Graph.BaseNode} [Node=Graph.BaseNode]
 * @template {Graph.BaseNodeOpts} [NodeOpts=Graph.BaseNodeOpts]
 * @template {Graph.BaseEdge<Node>} [Edge=Graph.BaseEdge<Node>]
 * @template {Graph.BaseEdgeOpts<Node>} [EdgeOpts=Graph.BaseEdgeOpts<Node>]
 * @implements {Graph.IGraph<Node, NodeOpts, Edge, EdgeOpts>}
 */
export class BaseGraph {
  /**
   * Set of nodes.
   * @type {Set<Node>}
   */
  nodes;
  /**
   * Edge representation:
   * succ.get(a).get(b) exists iff a -> b.
   * @type {Map<Node, Map<Node, Edge>>}
   */
  succ;
  /**
   * Reverse edge representation:
   * pred.get(a).get(b) exists iff b -> a.
   * @type {Map<Node, Map<Node, Edge>>}
   */
  pred;
  /**
   * Nodes as an array (useful degeneracy)
   * @type {Node[]}
   */
  nodesArray;
  /**
   * Edges as an array (useful degeneracy).
   * @type {Edge[]}
   */
  edgesArray;
  /**
   * Node lookup by `node.id`.
   * @type {Map<string, Node>}
   */
  idToNode;
  /**
   * Edge lookup by `edge.id`.
   * @type {Map<string, Edge>}
   */
  idToEdge;
  /** @type {Graph.EdgeClass<Node, Edge>} */
  EdgeClass;

  /** @param {Graph.EdgeClass<Node, Edge>} EdgeClass */
  constructor(EdgeClass) {
    this.EdgeClass = EdgeClass;
    this.nodes = new Set();
    this.succ = new Map();
    this.pred = new Map();
    this.nodesArray = [];
    this.edgesArray = [];
    this.idToNode = new Map();
    this.idToEdge = new Map();
  }

  /**
   * Get reachable nodes in breadth-first manner.
   * @param {Node} node
   * @returns {Node[]}
   */
  getReachableNodes(node) {
    const reachable = new Set([node]);
    let [count, frontier] = [0, [node]];
    while (reachable.size > count) {
      count = reachable.size;
      frontier = flatten(frontier.map((node) => this.getSuccs(node)));
      frontier.forEach((node) => reachable.add(node));
    }
    return Array.from(reachable.values());
  }

  /**
   * @param {Node} node 
   * @param {(node: Node) => boolean} stopWhen 
   * @returns {Node[]}
   */
  getReachableUpto(
    node,
    /**
     * Predicate should evaluate true at `node` iff we
     * should __not__ aggregate its successors.
     */
    stopWhen,
  ) {
    const reachable = new Set([node]);
    let [count, frontier] = [0, [node]];
    while (reachable.size > count) {
      count = reachable.size;
      frontier = flatten(frontier
        .map((node) => stopWhen(node) ? [] : this.getSuccs(node)));
      frontier.forEach((node) => reachable.add(node));
    }
    return Array.from(reachable.values());
  }

  reset() {
    this.nodes.clear();
    this.succ.clear();
    this.pred.clear();
    this.nodesArray = [];
    this.edgesArray = [];
    this.idToNode.clear();
    this.idToEdge.clear();
  }

  /** @param {Node} node */
  removeNode(node) {
    if (this.nodes.has(node)) {
      this.nodes.delete(node);
      removeFirst(this.nodesArray, node);
      this.idToNode.delete(node.id);
      // remove edges to `node`
      this.getPreds(node).forEach((other) =>
        this.removeEdge(this.getEdge(other, node)));
      // remove edges from `node`
      this.getSuccs(node).forEach((other) =>
        this.removeEdge(this.getEdge(node, other)));

      this.succ.delete(node);
      this.pred.delete(node);
      return true;
    }
    return false;
  }

  /**
   * Ensure nodes `src` and `dst` are connected.
   * Return their `Edge` if so, otherwise
   * connect them and return their new `Edge`.
   * @param {EdgeOpts} opts
   */
  connect(opts) {
    // if id provided, convert to node
    const src = (typeof opts.src === 'string')
      ? this.getNodeById(opts.src) : opts.src;
    const dst = (typeof opts.dst === 'string')
      ? this.getNodeById(opts.dst) : opts.dst;
    //
    if (src && dst) {
      let edge = this.getEdge(src, dst);
      if (edge) {
        return { edge, isNew: false };
      } // otherwise, instantiate one
      /**
       * EdgeClass _cannot_ handle id's,
       * because it doesn't know about rest of graph.
       */
      [opts.src, opts.dst] = [src, dst];
      edge = new this.EdgeClass(opts);
      this.registerEdge(/** @type {Edge} */ (edge));
      return { edge, isNew: true };
    }
    // can't connect a non-existent node
    console.error('Can\'t connect nodes:', src, dst, 'given', opts, 'in', this);
    //
    return { isNew: false, edge: null };
  }

  /**
   * Returns true iff was previously connected.
   * @param {Node} src;
   * @param {Node} dst 
   */
  disconnect(src, dst) {
    const edge = this.getEdge(src, dst);
    if (edge) {
      this.removeEdge(edge);
      return true;
    } else {
      console.error(
        'Failed to disconnect', src, dst, 'in', this);
    }
    return false;
  }

  /** @param {string} id */
  removeNodeById(id) {
    const node = this.idToNode.get(id);
    if (node) {
      return this.removeNode(node);
    }
    return false;
  }

  /** @param {string} edgeid */
  disconnectById(edgeid) {
    const edge = this.idToEdge.get(edgeid);
    if (edge) {
      return this.disconnect(edge.src, edge.dst);
    } else {
      console.error(
        `Cannot remove non-existent edge '${edgeid}'.`);
    }
    return false;
  }

  /**
   * @param {string} srcid 
   * @param {string} dstid 
   */
  disconnectByIds(srcid, dstid) {
    const src = this.idToNode.get(srcid);
    const dst = this.idToNode.get(dstid);
    if (src && dst) {
      // console.log(`Disconnecting`, src, dst);
      return this.disconnect(src, dst);
    } else {
      console.error(
        `Cannot remove edge ('${srcid}' -> '${dstid}') from`, src, 'to', dst);
    }
    return false;
  }
  
  /**
   * Is the given node in the graph?
   * @param {Node} node
   */
  hasNode(node) {
    return this.nodes.has(node);
  }
  
  /**
   * Is there an edge from `src` to `dst`?
   * @param {Node} src
   * @param {Node} dst 
   */
  isConnected(src, dst) {
    const succ = this.succ.get(src);
    return succ && succ.has(dst) || false;
  }

  /** @param {string} nodeid */
  getNodeByid(nodeid) {
    return this.idToNode.get(nodeid) || null;
  }

  /** @param {Edge | null} edge */
  removeEdge(edge) {
    if (edge) {
      const succ = this.succ.get(edge.src);
      if (succ) {
        succ.delete(edge.dst);
      }
      const pred = this.pred.get(edge.dst);
      if (pred) {
        pred.delete(edge.src);
      }
      this.idToEdge.delete(edge.id);
      removeFirst(this.edgesArray, edge);
    }
  }

  /**
   * We say a `node` _has a parent_ iff it has a single predecessor.
   * @param {Node} node 
   */
  getParent(node) {
    const preds = this.getPreds(node);
    return (preds.length === 1) ? preds[0] : null;
  }
  
  /**
   * Get all successor nodes of `node`.
   * @param {Node} node 
   */
  getSuccs(node) {
    const succ = this.succ.get(node);
    return succ && Array.from(succ.keys()) || [];
  }
  
  /**
   * Get all predecessor nodes of `node`.
   * @param {Node} node 
   */
  getPreds(node) {
    // log(`Getting preds of:`, node);
    const pred = this.pred.get(node);
    return pred && Array.from(pred.keys()) || [];
  }
  
  /**
   * Get all edges starting from `node`.
   * @param {Node} node 
   */
  getEdgesFrom(node) {
    const succ = this.succ.get(node);
    return succ && Array.from(succ.values()) || [];
  }
  
  /**
   * Get all edges ending at `node`.
   * @param {Node} node 
   */
  getEdgesTo(node) {
    const pred = this.pred.get(node);
    return pred && Array.from(pred.values()) || [];
  }
  
  /**
   * Return true iff `node` has some successor.
   * @param {Node} node
   */
  nodeHasSucc(node) {
    const succ = this.succ.get(node);
    return succ && (succ.size > 0) || false;
  }
  
  /**
   * Return true iff `node` has some predecessor.
   * @param {Node} node
   */
  nodeHasPred(node) {
    const pred = this.pred.get(node);
    return pred && (pred.size > 0) || false;
  }
  
  /**
   * Get `node` where `node.id === id`, or null.
   * @param {string} id
   */
  getNodeById(id) {
    return this.idToNode.get(id) || null;
  }
  
  /**
   * Get `edge` where `edge.id === id`, or null.
   * @param {string} id
   */
  getEdgeById(id) {
    return this.idToEdge.get(id) || null;
  }
  
  /**
   * Get `edge` from `src` to `dst`, or null.
   * @param {Node} src
   * @param {Node} dst 
   */
  getEdge(src, dst) {
    const nhood = this.succ.get(src);
    return nhood
      ? (nhood.get(dst) || null)
      : null;
  }

  /**
   * Register a (presumed new) node with the graph.
   * @param {Node} node
   * @protected
   */
  registerNode(node) {
    this.nodes.add(node);
    this.nodesArray.push(node);
    this.succ.set(node, new Map);
    this.pred.set(node, new Map);
    this.idToNode.set(node.id, node);
  }

  /**
   * Register (presumed new) nodes with the graph.
   * @param {Node[]} nodes
   * @protected
   */
  registerNodes(nodes) {
    nodes.forEach(node => {
      this.nodes.add(node);
      this.succ.set(node, new Map);
      this.pred.set(node, new Map);
      this.idToNode.set(node.id, node);
    });
    this.nodesArray.push(...nodes);
  }

  /**
   * Register a (presumed new) edge.
   * Assume respective nodes already registered.
   * @param {Edge} edge
   * @protected
   */
  registerEdge(edge) {
    const { src, dst } = edge;
    const succ = /** @type {Map<Node, Edge> } */ (this.succ.get(src));
    succ.set(dst, edge);
    const pred = /** @type {Map<Node, Edge> } */ (this.pred.get(dst));
    pred.set(src, edge);
    this.idToEdge.set(edge.id, edge);
    this.edgesArray.push(edge);
  }

  /**
   * Register (presumed new) edges.
   * Assume respective nodes already registered.
   * @param {Edge[]} edges
   * @protected
   */
  registerEdges(edges) {
    edges.forEach(edge => {
      const { src, dst } = edge;
      const succ = /** @type {Map<Node, Edge> } */ (this.succ.get(src));
      succ.set(dst, edge);
      const pred = /** @type {Map<Node, Edge> } */ (this.pred.get(dst));
      pred.set(src, edge);
      this.idToEdge.set(edge.id, edge);
    });
    this.edgesArray.push(...edges);
  }


  /** @returns {Graph.GraphJson<Node, Edge>} */
  json() {
    return {
      nodes: this.nodesArray.map(deepClone),
      edges: this.edgesArray.map(deepClone),
    };
  }
  
  /**
   * We assume graph is currently empty e.g. by first doing
   *`const graph = new BaseGraph(BaseEdgeClass)`.
   * @param {Graph.GraphJson<Node, Edge>} json 
   */
  from(json) {
    const nodes = json.nodes.map(deepClone);
    this.registerNodes(nodes);
    const edges = json.edges.map(def => new this.EdgeClass(def.origOpts));
    this.registerEdges(edges);
    return this;
  }
}

/**
 * @template {Graph.BaseNode} [Node=Graph.BaseNode]
 * @template {Graph.BaseEdgeOpts<Node>} [EdgeOpts=Graph.BaseEdgeOpts<Node>]
 * @implements {Graph.BaseEdge<Node, EdgeOpts>}
 */
export class BaseEdgeClass {
  id;
  src;
  dst;
  origOpts;

  /** @param {EdgeOpts} opts */
  constructor(opts) {
    this.src = /** @type {Node} */ (opts.src);
    this.dst = /** @type {Node} */ (opts.dst);
    this.id = `${this.src.id}->${this.dst.id}`;
    this.origOpts = opts;
  }
}
