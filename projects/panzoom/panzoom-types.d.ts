declare namespace PanZoom {

  export interface CssApi {
    parent: HTMLDivElement;
    translateRoot: HTMLDivElement;
    scaleRoot: HTMLDivElement;

    isPanning: boolean;
    opts: { minScale: number; maxScale: number; step: number; idleMs: number },
    pointers: PointerEvent[];
    origin: Vect | undefined;
    /** Target scale in `scaleRoot` */
    scale: number;
    start: {
      clientX: number | undefined;
      clientY: number | undefined;
      scale: number;
      distance: number;
    },
    /** Target translateX in `translateRoot` */
    x: number;
    /** Target translateY in `translateRoot` */
    y: number;

    evt: {
      wheel(e: WheelEvent): void;
      pointerdown(e: PointerEvent): void;
      pointermove(e: PointerEvent): void;
      pointerup(e: PointerEvent): void;
    };

    events: import('rxjs').Subject<PanZoom.CssInternalEvent>;
    /** UI is considered idle iff this is 0 */
    idleTimeoutId: number;
    transitionTimeoutId: number;

    clearTransition(): void;
    private delayIdle(): void;
    finishedTransition(type: 'completed' | 'cancelled');
    /** Taking CSS animation into account */
    getCurrentTransform(): { x: number; y: number; scale: number; };
    getWorld(e: { clientX: number; clientY: number; }): Geom.VectJson;
    getWorldAtCenter(): Geom.VectJson;
    private idleTimeout(): void;
    isIdle(): boolean;
    pan(toX: number, toY: number): void;
    rootRef(el: null | HTMLDivElement): void;
    /** Send world position of mouse/touch event */
    sendPointOnWire(wireKey: string, e: { clientX: number; clientY: number; }): void;
    transitionTo(toScale?: number, worldPoint?: Geom.VectJson, transitionMs?: number, timingFn?: string): void;
    updateView(): void;
    zoomToClient(toScale: number, e: { clientX: number; clientY: number; }): void;
    zoomWithWheel(event: WheelEvent): void;
  }

  type CssInternalEvent = (
    | { key: "cancelled-transition" }
    | { key: "completed-transition" }
    | { key: "ui-idle" }
  )

}
