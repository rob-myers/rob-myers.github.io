export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: Coord[][];
}

export type Coord = [number, number];

export interface RectJson {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VectJson {
  x: number;
  y: number;
}
