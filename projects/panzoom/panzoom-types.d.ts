declare namespace PanZoom {

  export interface CssExtApi  {
    events: import('rxjs').Subject<CssInternalEvent>;
    getWorld(e: { clientX: number; clientY: number; } ): Geom.VectJson;
    transitionTo(zoom?: number, point?: Geom.VectJson, ms?: number): void;
  }

  type CssInternalEvent = (
    | { key: "cancelled-transition" }
    | { key: "completed-transition" }
    | { key: "ui-idle" }
  )

}
