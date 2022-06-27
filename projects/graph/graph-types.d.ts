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

    plainJson(): GraphJson<Node, EdgeOpts>;
    plainFrom(json: GraphJson<Node, EdgeOpts>): this;
  }

  export interface GraphJson<Node extends BaseNode, EdgeOpts extends BaseEdgeOpts> {
    nodes: Node[];
    edges: EdgeOpts[];
  }

  export type BaseGraphJson = GraphJson<BaseNode, BaseEdgeOpts>;

  //#region RoomGraph

  export interface RoomGraphNodeRoom {
    type: 'room';
    /** `room-${roomId} */
    id: string;
    /** Index of `Geomorph.Layout['rooms']` */
    roomId: number;
  }
  export interface RoomGraphNodeDoor {
    type: 'door';
    /** `door-${doorIndex} */
    id: string;
    /** Index of `Geomorph.Layout['doors']` */
    doorId: number;
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
    /** Index of parent geomorph instance in its respective array */
    gmId: number;
    /** Transform of parent geomorph */
    transform: [number, number, number, number, number, number];
    /** Index of `Geomorph.GeomorphData['doors']` */
    doorId: number;
    /** Index of `Geomorph.GeomorphData['hullDoors']` */
    hullDoorId: number;
    /**
     * Is this door's parent geomorph in front of it?
     * That is, is the door's normal facing it's parent?
     */
    gmInFront: boolean;
    /** Direction it faces in world coords */
    direction: null | Geom.Direction;
    /**
     * Does this node connect to another door i.e.
     * establish a connection between two geomorphs?
     */
    sealed: boolean;
  }

  export type GmGraphNode = (
    | GmGraphNodeGm
    | GmGraphNodeDoor
  );

  export type GmGraphEdgeOpts = BaseEdgeOpts;

  export type GmGraph = import('./gm-graph').gmGraphClass;

  export interface OpenDoorArea {
    gmId: number;
    doorId: number;
    /** For hull doors, the roomId of adjacent room in adjacent geomorph */
    adjRoomId: null | number;
    /** The area in world coords */
    poly: Geom.Poly;
  }

  /** Given a hull door, the respective ids in adjacent geomorph */
  export interface GmAdjRoomCtxt {
    adjGmId: number;
    adjRoomId: number;
    adjHullId: number;
    adjDoorId: number;
  }

  //#endregion
  
  //#region FloorGraph

  /**
   * Based on `Nav.GraphNode`
   */
  interface FloorGraphNodeBase {
    type: 'tri';
    /** `tri-${index} */
    id: string;
    /**
     * Index of this node in its parent array,
     * originally `Nav.GraphNode[]`.
     */
    index: number;
    portals: number[][];
    vertexIds: number[];
  }
  
  interface FloorGraphNodeJson extends FloorGraphNodeBase {
    centroid: Geom.VectJson;
  }
  
  interface FloorGraphNode extends FloorGraphNodeBase {
    centroid: Geom.Vect;
    // A* related
    f?: number;
    g?: number;
    h?: number;
    cost: number;
    visited: boolean;
    closed: boolean;
    parent: null | FloorGraphNode;
    /**
     * This info is already in edges, yet used by `AStar`.
     * We could remove it, but prefer to leave `AStar` as is,
     * recalling it originally comes from three-pathfinding.
     */
    neighbours: number[];
  }

  export type FloorGraphEdgeOpts = BaseEdgeOpts;

  /** We use Nav.Zone instead. */
  export type FloorGraphJson = never;

  export type FloorGraph = import('./floor-graph').floorGraphClass;

  //#endregion

}
