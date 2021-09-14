declare namespace Geom {

  export type Coord = [number, number];

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
    vs: import('./vect').Vect[]; 
    tris: [number, number, number][];
  }

}