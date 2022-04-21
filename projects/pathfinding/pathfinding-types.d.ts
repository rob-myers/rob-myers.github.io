declare namespace Nav {

  type Vect = import('../geom').Vect;
  
  export type Graph = GraphNode[];

  export interface GraphNode {
    id: number;
    neighbours: number[];
    f: number;
    g: number;
    h: number;
    cost: number;
    visited: boolean;
    closed: boolean;
    parent: null | GraphNode;
    portals: number[][];
    vertexIds: number[];
    centroid: Vect;
  }

  export interface NavPoly {
    vertexIds: number[];
    neighbours: Set<NavPoly>;
    centroid: Vect;
    group?: number;
  }

  export interface Zone {
    vertices: VectJson[];
    groups: GraphNode[][];
  }

  export interface Group {
    id: number;
    neighbours: number[];
    vertexIds: number[];
    centroid: Vect;
    portals: any[]; // ?
  }

}
