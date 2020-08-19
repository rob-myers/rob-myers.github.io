export interface GeomRootState {
  key: string;
  /** How many GeomRoot components are tracking this state? */
  openCount: number;
}

export function createGeomRoot(geomKey: string): GeomRootState {
  return {
    key: geomKey,
    openCount: 1,
  };
}
