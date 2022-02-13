declare namespace NPCTest {

  export interface NPCsProps {
    defs: NPCDef[];
    onLoad: (api: NPCTest.NPCsApi) => void;
  }

  interface NPCDef {
    key: string;
    zoneKey: string;
    /** Initially paused? */
    paused: boolean;
    /** Initial position */
    src: Geom.VectJson;
    /** Initial target */
    dst: Geom.VectJson;
    /** Initial angle */
    angle: number;
  }

  export interface NPCsApi {
    apis: NPCApi[];
    readonly highlightPath: (key: string) => void;
    // ...
  }

  export interface NPCApi {
    def: NPCDef;

    key: string;
    move: Animation;
    look: Animation;
    readonly geom: {
      /** Full navigation path */
      navPath: Geom.Vect[];
      /** Subpath inducing the animation, */
      animPath: Geom.Vect[];
      /** Thin 4-gons representing edges of navPath */
      navPathPolys: Geom.Poly[];
    };
    readonly aux: {
      /** Group id of navpath  */
      readonly groupId: null | number;
      /** How many times has a new animation been created? */
      count: number;
      edges: ({ p: Geom.Vect; q: Geom.Vect })[];
      elens: number[];
      sofars: number[];
      total: number;
      angs: number[];
    };
    /** Radians */
    readonly getNPCAngle: () => number;
    /** Radians */
    readonly getLookAngle: () => number;
    readonly getPosition: () => Geom.Vect;
    readonly pause: () => void;
    readonly play: () => void;

    el: {
      npc: SVGGElement;
      look: SVGGElement;
      path: SVGPolylineElement;
      dots: SVGGElement;
    };
    srcApi: NPCTest.DraggableNodeApi;
    dstApi: NPCTest.DraggableNodeApi;
    rayApi: NPCTest.DraggableRayApi;

    internal: InternalNpcApi;
  }

  export interface InternalNpcApi {
    /** Should cancel drag of node? */
    shouldCancelNavDrag(curr: Geom.Vect, next: Geom.Vect, type: 'src' | 'dst'): boolean,
    followNavPath(): void;
    initialize(el: SVGGElement): void;
    onDraggedSrcNode(): void;
    onClickedSrcNode(): void;
    onDraggedDstNode(): void;
    onDragLookRay(target: Geom.Vect): void;
    onClickedDstNode(): void;
    onFinishMove(): void;
    renderNavPath(): void;
    resetLook(): void;
    reverseNavPath(): void;
    swapNavNodes(): void;
    togglePaused(): void;
    updateAnimAux(): void;
    /** Compute navpath from NPC's current position to `dst`. */
    updateNavPath(dst: Geom.Vect): void;
  }

  export interface DraggableNodeApi {
    readonly moveTo: (p: Geom.VectJson) => void;
    readonly getPosition: () => Geom.Vect;
  }
  export interface DraggableNodeProps {
    initial: Geom.VectJson;
    radius?: number;
    icon?: IconKey;
    stroke?: string;
    onLoad?: (api: DraggableNodeApi) => void;
    onStart?: () => void;
    onStop?: (position: Geom.Vect) => void;
    onClick?: (position: Geom.Vect) => void;
    shouldCancel?: (current: Geom.Vect, next: Geom.Vect) => void;
  }
  export type IconKey = (
    | 'eye'
    | 'down'
    | 'right'
    | 'run'
    | 'finish'
  );

  export interface DraggableRayApi {
    readonly disable: () => void;
    readonly enable: (source: Geom.VectJson, angle: number) => void;
    readonly setAngle: (angle: number) => void;
  }
  export interface DraggableRayProps {
    radius: number;
    onLoad?: (api: DraggableRayApi) => void;
    onStart?: () => void;
    onStop?: (target: Geom.Vect) => void;
    onClick?: () => void;
  }
  
  export interface MessagesApi {
    createText(key: string, text: string[], position: Geom.VectJson): void;
    get(key: string): SVGForeignObjectElement | undefined;
    remove(key: string): boolean;
  }
  export interface MessagesProps {
    onLoad?: (api: MessagesApi) => void;
  }


}
