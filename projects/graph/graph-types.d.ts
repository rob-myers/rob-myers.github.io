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

  export interface RoomGraphNodeRoom {
    type: 'room';
    /** `room-${holeIndex} */
    id: string;
    /** Index of `Geomorph.Layout['holes']` */
    holeIndex: number;
  }
  export interface RoomGraphNodeDoor {
    type: 'door';
    /** `door-${doorIndex} */
    id: string;
    /** Index of `Geomorph.Layout['doors']` */
    doorIndex: number;
  }

  export interface RoomGraphNodeWindow {
    type: 'window';
    /** `window-${doorIndex} */
    id: string;
    /** Index of `Geomorph.Layout['windows']` */
    windowIndex: number;
  }

  export type RoomGraphNode = (
    | RoomGraphNodeRoom
    | RoomGraphNodeDoor
    | RoomGraphNodeWindow
  );

  export type RoomGraphEdgeOpts = BaseEdgeOpts;

  export type RoomGraphJson = GraphJson<RoomGraphNode, RoomGraphEdgeOpts>;

  export type RoomGraph = import('./room-graph').RoomGraph;

  //#endregion 

  //#region GmGraph

  /** A transformed geomorph */
  export interface GmGraphNodeGm {
    type: 'gm';
    /** Key of parent geomorph */
    gmKey: Geomorph.LayoutKey;
    gmIndex: number;
    /** `gm-${gmKey}-[${transform}]` */
    id: string;
    /** Transform of parent geomorph */
    transform: [number, number, number, number, number, number];
  }

  /** A hull door of some transformed geomorph */
  export interface GmGraphNodeDoor {
    type: 'door';
    /** `door-${gmKey}-[${transform}]-${hullDoorIndex}` */
    id: string;
    /** Key of parent geomorph */
    gmKey: Geomorph.LayoutKey;
    gmIndex: number;
    /** Transform of parent geomorph */
    transform: [number, number, number, number, number, number];
    /** Index of `Geomorph.UseGeomorphsItem['hullDoors']` */
    hullDoorId: number;
    /**
     * Is this door's parent geomorph in front of it?
     * That is, is the door's normal facing it's parent?
     */
    gmInFront: boolean;
  }

  export type GmGraphNode = (
    | GmGraphNodeGm
    | GmGraphNodeDoor
  );

  export type GmGraphEdgeOpts = BaseEdgeOpts;

  export type GmGraph = import('./gm-graph').GmGraph;

  //#endregion

}
