declare namespace Graph {

  export interface BaseNode {
    /** Identifies the node. */
    id: string;
  }
  export interface BaseEdgeOpts {
    src: string;
    dst: string;
  }

  export type Edge<
    Node extends BaseNode = BaseNode,
    EdgeOpts extends BaseEdgeOpts = BaseEdgeOpts
  > = Omit<EdgeOpts, 'id' | 'src' | 'dst'> & {
    /** `${src_id}->${dst_id}` */
    id: string;
    src: Node;
    dst: Node;
  }

  export interface IGraph<
    Node extends BaseNode,
    EdgeOpts extends BaseEdgeOpts
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

  export type BaseGraphJson = GraphJson<BaseNode, BaseEdgeOpts>;

  //#region RoomGraph

  export type RoomNodeOpts = (
    | RoomOfTypeRoom
    | RoomOfTypeDoor
  );
      
  export interface RoomOfTypeRoom {
    type: 'room';
    /** `room-${holeIndex} */
    id: string;
    /** Indexes `Geomorph.Layout['holes']` */
    holeIndex: number;
  }
  export interface RoomOfTypeDoor {
    type: 'door';
    /** `door-${doorIndex} */
    id: string;
    /** Indexes `Geomorph.Layout['doors']` */
    doorIndex: number;
  }

  export type RoomGraphNode = RoomNodeOpts;

  export type RoomGraphEdgeOpts = BaseEdgeOpts;

  export type RoomGraphJson = GraphJson<RoomGraphNode, RoomGraphEdgeOpts>;

  export type RoomGraph = import('./room-graph').RoomGraph;

  //#endregion 

  //#region GmGraph

  // TODO

  //#endregion

}
