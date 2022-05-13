declare namespace PanZoom {

  // TODO move types from CssPanZoom here

  export interface CssExtApi  {
    onCancelled: (() => void)[];
    onCompleted: (() => void)[];
    getWorld(e: { clientX: number; clientY: number; } ): Geom.VectJson;
    transitionTo(zoom: number, point: Geom.VectJson, lockMs?: number): void;
  }
}
 