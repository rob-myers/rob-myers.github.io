declare namespace Geom {

  export type Vect = import('.').Vect;
  export type Rect = import('.').Rect;
  export type Poly = import('.').Poly;
  export type Ray = import('.').Ray;
  export type Mat = import('.').Mat;
  
  export type Coord = [number, number];
  export type Seg = { src: Vect; dst: Vect };

  export interface GeoJsonPolygon {
    /** Identifier amongst GeoJSON formats. */
    type: 'Polygon';
    /**
     * The 1st array defines the _outer polygon_,
     * the others define non-nested _holes_.
     */
    coordinates: Coord[][];
    meta?: Record<string, string>;
  }

  export interface VectJson {
    x: number;
    y: number;
  }

  export interface RectJson {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  export interface Triangulation {
    vs: Vect[]; 
    tris: [number, number, number][];
  }

  export interface TriangulationJson {
    vs: VectJson[]; 
    tris: [number, number, number][];
  }

  export interface AngledRect<T> {
    rect: T;
    /** Radians */
    angle: number;
  }

  /** 'n' | 'e' | 's' | 'w' */
  export type Direction = 0 | 1 | 2 | 3;
}
