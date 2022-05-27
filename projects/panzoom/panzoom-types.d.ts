declare namespace PanZoom {

  export interface CssApi {
    parent: HTMLDivElement;
    translateRoot: HTMLDivElement;
    scaleRoot: HTMLDivElement;

    panning: boolean;
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
    /** [translate, scale] */
    anims: [null | Animation, null | Animation];
    worldPointerDown: Geom.Vect;

    cancelAnimations(): void;
    private delayIdle(): void;
    /** Taking CSS animation into account */
    getCurrentTransform(): { x: number; y: number; scale: number; };
    getWorld(e: { clientX: number; clientY: number; }): Geom.VectJson;
    getWorldAtCenter(): Geom.VectJson;
    private idleTimeout(): void;
    isIdle(): boolean;
    pan(toX: number, toY: number): void;
    async panZoomTo(scale?: number, worldPoint?: Geom.VectJson, durationMs: number, easing?: string);
    rootRef(el: null | HTMLDivElement): void;
    /** Use `(x, y, scale)` to set `style.transform`s */
    setStyles(): void;
    /**
     * - Set `(x, y, scale)` using `getCurrentTransform()`
     * - Then use `(x, y, scale)` to update `style.transform`s
     */
    syncStyles(): void;
    zoomToClient(toScale: number, e: { clientX: number; clientY: number; }): void;
    zoomWithWheel(event: WheelEvent): void;
  }

  type CssInternalEvent = (
    | CssInternalTransitionEvent
    | {
      key: 'pointerup';
      point: Geom.VectJson;
      /** Distance from pointerdown in world coords */
      distance: number;
      tags: string[];
    }
    | { key: "ui-idle" }
  )

  type CssInternalTransitionEvent = (
    | { key: "cancelled-transition" }
    | { key: "completed-transition" }
  )

}
