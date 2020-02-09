declare module 'cdt2d' {

  type Coord = [number, number];
  type IndexPair = [number, number];
  type IndexTriple = [number, number, number];

  export interface Cdt2dOptions {
    delaunay?: boolean;
    interior?: boolean;
    exterior?: boolean;
  }

  export default function(
    points: Coord[],
    edges?: IndexPair[],
    options?: Cdt2dOptions,
  ): IndexTriple[];
}

