declare namespace Graph {

  export interface BaseNodeOpts {
    /** Identifies the node. */
    id: string;
  }

  export interface BaseNode<NodeOpts extends BaseNodeOpts = BaseNodeOpts> {
    /** Equals `opts.id` */
    id: string;
    opts: NodeOpts;
  }

  export interface BaseEdgeOpts<Node extends BaseNode> {
    src: Node | string;
    dst: Node | string;
  }

  /** Serializable and implementable, unlike `BaseEdgeClass`. */
  export interface BaseEdge<
    Node extends BaseNode = BaseNode,
    EdgeOpts extends BaseEdgeOpts<Node> = BaseEdgeOpts<Node>
  > {
    /** `${src_id}->${dst_id}` */
    id: string;
    src: Node;
    dst: Node;
    origOpts: EdgeOpts;
  }

  export interface EdgeClass<Node extends BaseNode, Edge extends BaseEdge<Node>> {
    new(opts: Edge['origOpts']): Edge;
  }

  export interface IGraph<
    Node extends BaseNode,
    NodeOpts extends BaseNodeOpts,
    Edge extends BaseEdge<Node>,
    EdgeOpts extends BaseEdgeOpts<Node>
  > {
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

    json(): GraphJson<Node, Edge>;
    from(json: GraphJson<Node, Edge>): this;
  }

  export interface GraphJson<Node extends BaseNode, Edge extends BaseEdge> {
    nodes: Node[];
    edges: Edge[];
  }

}
