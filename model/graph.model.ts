import { flatten, removeFirst } from './generic.model';

//#region nodes

/**
 * A single graph class may have multiple node classes with respective options.
 */
export interface BaseNodeOpts {
  /** uid for node */
  id: string;
  /** constructor uid; usually refined to a string literal type. */
  key: string;
  context?: any;
}

export class BaseNode {
  /** Always required, even if only one node class. */
  public key: string;
  /** Identifies the node. */
  public id: string;
  /** Original options used to construct node, so can clone. */
  public origOpts: BaseNodeOpts;

  constructor(opts: BaseNodeOpts) {
    this.key = opts.key;
    this.id = opts.id;
    this.origOpts = opts;
  }
}

//#endregion

//#region edges

/**
 * Expect a graph class to have exactly one edge class,
 * with exactly one repective options.
 */
export interface BaseEdgeOpts<Node extends BaseNode> {
  src: Node;
  dst: Node;
}

/** Serializable edge */
export interface BaseEdgeJson {
  src: string;
  dst: string;
}

export class BaseEdge<Node extends BaseNode = BaseNode> {
  /** `${src_id}->${dst_id}` */
  public id: string;
  public src: Node;
  public dst: Node;

  constructor(opts: BaseEdgeOpts<Node>) {
    this.src = opts.src;
    this.dst = opts.dst;
    this.id = `${this.src.id}->${this.dst.id}`;
  }
}

//#endregion

//#region IGraph

export interface IGraph<
  Node extends BaseNode,
  NodeOpts extends BaseNodeOpts,
  Edge extends BaseEdge<Node>,
  EdgeOpts extends BaseEdgeOpts<Node>
> {
  ensureNode<T extends Node = Node>(opts: NodeOpts): {
    isNew: boolean;
    node: T;
  };
  connect(opts: EdgeOpts): { isNew: boolean; edge: Edge | null };
  disconnect(src: Node, dst: Node): boolean;
  removeNode(node: Node): boolean;
  removeNodeById(id: string): boolean;
  disconnectById(edgeid: string): boolean;
  disconnectByIds(srcid: string, dstid: string): boolean;
  reset(): void;
  hasNode(node: Node): boolean;
  isConnected(src: Node, dst: Node): boolean;
  getNodeByid(nodeid: string): Node | null;
}

//#endregion

//#region base graph

export abstract class BaseGraph<
  Node extends BaseNode = BaseNode,
  NodeOpts extends BaseNodeOpts = BaseNodeOpts,
  Edge extends BaseEdge<Node> = BaseEdge<Node>,
  EdgeOpts extends BaseEdgeOpts<Node> = BaseEdgeOpts<Node>
>
implements IGraph<Node, NodeOpts, Edge, EdgeOpts> {
  /**
   * Node groups by key. Instantiable subclasses should refine this,
   * e.g. `keyToNodes: { basic: BasicD3Node, rich: RichD3Node  }`
   */
  public keyToNodes: { [nodeClassKey: string]: Node[] };
  /** Set of nodes. */
  public nodes: Set<Node>;
  /**
   * Edge representation:
   * succ.get(a).get(b) exists iff a -> b.
   */
  public succ: Map<Node, Map<Node, Edge>>;
  /**
   * Reverse edge representation:
   * pred.get(a).get(b) exists iff b -> a.
   */
  public pred: Map<Node, Map<Node, Edge>>;
  /** Nodes as an array (useful degeneracy) */
  public nodesArray: Node[];
  /** Edges as an array (useful degeneracy). */
  public edgesArray: Edge[];
  /** Node lookup by `node.id`. */
  public idToNode: Map<string, Node>;
  /** Edge lookup by `edge.id`. */
  public idToEdge: Map<string, Edge>;

  constructor(
    options: {},
    public toNodeClass: {
      /** Can construct dynamically. */
      [nodeClassKey: string]: { new(opts: NodeOpts): Node }; 
      /** Must define fallback. */
      default: { new(opts: NodeOpts): Node };
    },
    /**
     * Technically, arg type should be BaseEdgeOpts<Node>.
     * as EdgeClass constructor cannot handle ids.
     * So in `this.connect` below, we replace ids by nodes.
     */
    public EdgeClass: { new(opts: EdgeOpts): Edge },
  ) {
    this.nodes = new Set<Node>();
    this.succ = new Map<Node, Map<Node, Edge>>();
    this.pred = new Map<Node, Map<Node, Edge>>();
    this.nodesArray = [];
    this.edgesArray = [];
    this.idToNode = new Map<string, Node>();
    this.idToEdge = new Map<string, Edge>();
    // keyToNodes has same keys as toNodeClass
    this.keyToNodes = {};
    Object.keys(toNodeClass).map((key) =>
      this.keyToNodes[key] = []);
  }

  /**
   * Get reachable nodes in breadth-first manner.
   */
  public getReachableNodes(node: Node): Node[] {
    const reachable = new Set<Node>([node]);
    let [count, frontier] = [0, [node]];
    while (reachable.size > count) {
      count = reachable.size;
      frontier = flatten(frontier.map((node) => this.getSuccs(node)));
      frontier.forEach((node) => reachable.add(node));
    }
    return Array.from(reachable.values());
  }

  public getReachableUpto(
    node: Node,
    /**
     * Predicate should evaluate true at `node` iff we
     * should __not__ aggregate its successors.
     */
    stopWhen: (node: Node) => boolean,
  ): Node[] {
    const reachable = new Set<Node>([node]);
    let [count, frontier] = [0, [node]];
    while (reachable.size > count) {
      count = reachable.size;
      frontier = flatten(frontier
        .map((node) => stopWhen(node) ? [] : this.getSuccs(node)));
      frontier.forEach((node) => reachable.add(node));
    }
    return Array.from(reachable.values());
  }

  public reset(): void {
    Object.keys(this.keyToNodes)
      .map((key) => this.keyToNodes[key] = []);
    this.nodes.clear();
    this.succ.clear();
    this.pred.clear();
    this.nodesArray = [];
    this.edgesArray = [];
    this.idToNode.clear();
    this.idToEdge.clear();
  }

  /**
   * Create node if one with given id doesn't exist,
   * otherwise return pre-existing. Not to be overridden.
   */
  public ensureNode<T extends Node = Node>(opts: NodeOpts): {
    isNew: boolean;
    node: T;
    // node: ToNodeType[typeof opts.key],
  } {
    // log(`Looking for node using opts:`, opts);
    let node = this.idToNode.get(opts.id);
    if (node) {
      return {
        isNew: false,
        node: node as T,
      };
    }
    // create new node
    node = new this.toNodeClass[opts.key](opts);
    // log(`Registering node:`, node);
    this.registerNode(node);
    return { isNew: true, node: node as T };
  }

  public removeNode(node: Node): boolean {
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
      removeFirst(this.keyToNodes[node.key], node as any);
      return true;
    }
    return false;
  }

  /**
   * Ensure nodes `src` and `dst` are connected.
   * Return their `Edge` if so, otherwise
   * connect them and return their new `Edge`.
   */
  public connect(opts: EdgeOpts): { isNew: boolean; edge: Edge | null } {
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
      this.registerEdge(edge);
      return { edge, isNew: true };
    }
    // can't connect a non-existent node
    console.error('Can\'t connect nodes:', src, dst, 'given', opts, 'in', this);
    //
    return { isNew: false, edge: null };
  }

  /** Returns true iff was previously connected. */
  public disconnect(src: Node, dst: Node): boolean {
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

  public removeNodeById(id: string): boolean {
    const node = this.idToNode.get(id);
    if (node) {
      return this.removeNode(node);
    }
    return false;
  }

  public disconnectById(edgeid: string): boolean {
    const edge = this.idToEdge.get(edgeid);
    if (edge) {
      return this.disconnect(edge.src, edge.dst);
    } else {
      console.error(
        `Cannot remove non-existent edge '${edgeid}'.`);
    }
    return false;
  }

  public disconnectByIds(srcid: string, dstid: string): boolean {
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
  
  /** Is the given node in the graph? */
  public hasNode(node: Node): boolean {
    return this.nodes.has(node);
  }
  
  /** Is there an edge from `src` to `dst`? */
  public isConnected(src: Node, dst: Node): boolean {
    const succ = this.succ.get(src);
    return succ && succ.has(dst) || false;
  }

  public getNodeByid(nodeid: string): Node | null {
    return this.idToNode.get(nodeid) || null;
  }

  public removeEdge(edge: Edge | null) {
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

  /** `node` has a parent iff it has a single predecessor. */
  public getParent(node: Node): Node | null {
    const preds = this.getPreds(node);
    return (preds.length === 1) ? preds[0] : null;
  }
  
  /** Get all successor nodes of `node`. */
  public getSuccs(node: Node): Node[] {
    const succ = this.succ.get(node);
    return succ && Array.from(succ.keys()) || [];
  }
  
  /** Get all predecessor nodes of `node`. */
  public getPreds(node: Node): Node[] {
    // log(`Getting preds of:`, node);
    const pred = this.pred.get(node);
    return pred && Array.from(pred.keys()) || [];
  }
  
  /** Get all edges starting from `node`. */
  public getEdgesFrom(node: Node): Edge[] {
    const succ = this.succ.get(node);
    return succ && Array.from(succ.values()) || [];
  }
  
  /** Get all edges ending at `node`. */
  public getEdgesTo(node: Node): Edge[] {
    const pred = this.pred.get(node);
    return pred && Array.from(pred.values()) || [];
  }
  
  /** Return true iff `node` has some successor. */
  public nodeHasSucc(node: Node): boolean {
    const succ = this.succ.get(node);
    return succ && (succ.size > 0) || false;
  }
  
  /** Return true iff `node` has some predecessor. */
  public nodeHasPred(node: Node): boolean {
    const pred = this.pred.get(node);
    return pred && (pred.size > 0) || false;
  }

  /** Get `node` where `node.id === id`, or null. */
  public getNodeById(id: string): Node | null {
    return this.idToNode.get(id) || null;
  }

  /** Get `edge` where `edge.id === id`, or null. */
  public getEdgeById(id: string): Edge | null {
    return this.idToEdge.get(id) || null;
  }
  
  /** Get `edge` from `src` to `dst`, or null. */
  public getEdge(src: Node, dst: Node): Edge | null {
    const nhood = this.succ.get(src);
    return nhood
      ? (nhood.get(dst) || null)
      : null;
  }

  /**
   * _TODO_ clarify
   */
  public static parseJson(
    input: any,
    graph: BaseGraph,
    _parent: BaseNode | null,
    path: string,
  ): BaseNode {
    if (input === undefined) {
      throw Error('Unexpected undefined input.');
    }
    if (Array.isArray(input)) {
      const { node } = graph.ensureNode<BaseNode>({
        key: 'default',
        id: path, // use path for id
        context: { input, path }, 
      });
      for (const [index, value] of input.entries()) {
        const child = BaseGraph.parseJson(
          value, graph, node, joinPaths(path, index));
        graph.connect({ src: node, dst: child });
      }
      return node;
    }
    if (typeof input === 'boolean') {
      return graph.ensureNode({
        key: 'default',
        id: path, // use path for id
        context: { input, path },
      }).node;
    }
    if (input === null) {
      return graph.ensureNode({
        key: 'default',
        id: path, // use path for id
        context: { input, path },
      }).node;
    }
    if (typeof input === 'number') {
      return graph.ensureNode({
        key: 'default',
        id: path, // use path for id
        context: { input, path },
      }).node;
    }
    if (typeof input === 'object') {
      // because _not_ an Array, nor null
      const { node } = graph.ensureNode<BaseNode>({
        key: 'default',
        id: path, // use path for id
        context: { input, path },
      });
      for (const key of Object.keys(input)) {
        const child = BaseGraph.parseJson(
          input[key], graph, node, joinPaths(path, key));
        graph.connect({ src: node, dst: child });
      }
      return node;
    }
    if (typeof input === 'string') {
      return graph.ensureNode({
        key: 'default',
        id: path, // use path for id
        // id: input,
        context: { input, path },
      }).node;
    }
    throw Error(`Input '${input}' has unexpected type.`);
  }

  /**
   * Register a (presumed new) node with the graph.
   */
  protected registerNode(node: Node) {
    this.nodes.add(node);
    this.nodesArray.push(node);
    this.succ.set(node, new Map<Node, Edge>());
    this.pred.set(node, new Map<Node, Edge>());
    this.idToNode.set(node.id, node);
    this.keyToNodes[node.key].push(node as any);
  }

  /**
   * Register a (presumed new) edge.
   * Assume respective nodes already registered.
   */
  protected registerEdge(edge: Edge) {
    const { src, dst } = edge;
    const succ = this.succ.get(src);
    if (succ) {
      succ.set(dst, edge);
    }
    const pred = this.pred.get(dst);
    if (pred) {
      pred.set(src, edge);
    }
    this.idToEdge.set(edge.id, edge);
    this.edgesArray.push(edge);
  }
}
//#endregion

/**
 * Join two string | number paths with a `.`, handling empty-paths.
 */
function joinPaths(
  path0: string | number,
  path1: string | number
): string {
  path0 = String(path0);
  path1 = String(path1);
  return path0
    ? (path1 ? `${path0}.${path1}` : path0)
    : path1;
}
