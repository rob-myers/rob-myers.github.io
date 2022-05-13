declare namespace PanZoom {

  // TODO move types from CssPanZoom here

  export interface CssExtApi  {
    events: import('rxjs').Subject<CssInternalEvent>;
    onCancelled: (() => void)[];
    onCompleted: (() => void)[];
    getWorld(e: { clientX: number; clientY: number; } ): Geom.VectJson;
    transitionTo(zoom?: number, point?: Geom.VectJson, ms?: number): void;
  }

  type CssInternalEvent = (
    | { key: "dst"; x: number; y: number; scale: number }
  )
}
 