export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: Coord[][];
}

export type Coord = [number, number];

export type RectJson = [number, number, number, number];

export interface VectJson {
  x: number;
  y: number;
}
