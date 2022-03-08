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
    src: string;
    dst: string;
  }

  export interface Edge<
    Node extends BaseNode = BaseNode,
    EdgeOpts extends BaseEdgeOpts<Node> = BaseEdgeOpts<Node>
  > {
    /** `${src_id}->${dst_id}` */
    id: string;
    src: Node;
    dst: Node;
    origOpts: EdgeOpts;
  }

  export interface IGraph<
    Node extends BaseNode,
    NodeOpts extends BaseNodeOpts,
    EdgeOpts extends BaseEdgeOpts<Node>
  > {
    connect(opts: EdgeOpts): { isNew: boolean; edge: Edge<Node, EdgeOpts> | null };
    disconnect(src: Node, dst: Node): boolean;
    removeNode(node: Node): boolean;
    removeNodeById(id: string): boolean;
    disconnectById(edgeid: string): boolean;
    disconnectByIds(srcid: string, dstid: string): boolean;
    reset(): void;
    hasNode(node: Node): boolean;
    isConnected(src: Node, dst: Node): boolean;
    getNodeByid(nodeid: string): Node | null;

    json(): GraphJson<Node, EdgeOpts>;
    from(json: GraphJson<Node, EdgeOpts>): this;
  }

  export interface GraphJson<Node extends BaseNode, EdgeOpts extends BaseEdgeOpts> {
    nodes: Node[];
    edges: EdgeOpts[];
  }

  export type BaseGraphJson = GraphJson<BaseNode, BaseEdgeOpts<BaseNode>>;

  //#region RoomGraph
  export type RoomNodeOpts = (
    | RoomOfTypeRoom
    | RoomOfTypeDoor
  );
      
  export interface RoomOfTypeRoom extends BaseNodeOpts {
    type: 'room';
    /** `room-${holeIndex} */
    id: string;
    /** Indexes `Geomorph.Layout['holes']` */
    holeIndex: number;
  }
  export interface RoomOfTypeDoor extends BaseNodeOpts {
    type: 'door';
    /** `door-${doorIndex} */
    id: string;
    /** Indexes `Geomorph.Layout['doors']` */
    doorIndex: number;
  }

  export interface RoomGraphNode extends BaseNode<RoomNodeOpts> {}

  export interface RoomEdgeOpts extends BaseEdgeOpts<RoomGraphNode> {}

  export type RoomGraphJson = GraphJson<RoomGraphNode, RoomEdgeOpts>;

  export type RoomGraph = import('./room-graph').RoomGraph;
  //#endregion 

}
