// Used by @store/geom.duck.ts and monaco-editor at runtime.

import Flatten from './flatten-js/core';

/**
 * Used by @store/geom.duck and also `useSelector` at runtime.
 */
export interface State {}

/**
 * Must keep in sync with `Act` from @store/geom.duck.
 * Used by `useDispatch` at runtime.
 */
export type DispatchableSync = never;

/**
 * Must keep in sync with `Thunk` from @store/geom.duck.
 * Used by `useDispatch` at runtime.
 */
export type DispatchableThunk = (
  | { type: '[geom] create polygon'; args: PolygonJson; returns: Flatten.Polygon }
);


// Serialized versions of @flatten-js/core classes

export interface ArcJson {
  name: 'arc';
  /** Arc center */
  pc: PointJson;
  /** Arc radius */
  r: number;
  /** Arc start angle in radians */
  startAngle: number;
  /** Arc end angle in radians */
  endAngle: number;
  /** Arc orientation */
  counterClockwise?: boolean;
}

export interface BoxJson {
  name: 'box';
  /** Minimal x coordinate */
  xmin: number
  /** Minimal y coordinate */
  ymin: number;
  /** Maximal x coordinate */
  xmax: number;
  /** Maximal y coordinate */
  ymax: number;
}

export interface CircleJson {
  name: 'circle';
  /** Circle center */
  pc: PointJson;
  /** Circle radius */
  r: number;
}

export type EdgeJson = (
  | ArcJson
  | SegmentJson
);

export interface FaceJson {
  name: 'face';
  edges: EdgeJson[];
}

export interface LineJson {
  name: 'line';
  /** Point a line passes through */
  pt: PointJson;
  /**
   * Normal vector to a line <br/>
   * Vector is normalized (length == 1)<br/>
   * Direction of the vector is chosen to satisfy inequality norm * p >= 0
   */
  norm: VectorJson;
}

export interface MultilineJson {
  name: 'multiline';
  edges: (EdgeJson | LineJson | RayJson)[];
}

export interface PointJson {
  name: 'point';
  x: number;
  y: number;
}

export interface PolygonJson {
  name: 'polygon';
  faces: FaceJson[];
}

export interface RayJson {
  name: 'ray';
  pt: PointJson;
  norm: VectorJson;
}

export interface SegmentJson {
  name: 'segment';
  /** Start point */
  ps: PointJson;
  /** End point */
  pe: PointJson;
}

export interface VectorJson {
  name: 'vector';
  x: number;
  y: number;
}
