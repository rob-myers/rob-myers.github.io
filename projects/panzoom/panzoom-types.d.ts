declare namespace PanZoom {

  // TODO move types from CssPanZoom here

  export interface CssExtApi  {
    getWorld(e: { clientX: number; clientY: number; } ): Geom.VectJson;
    zoomToWorld(zoom: number, point: Geom.VectJson, lockMs?: number): void;
  }
}
 