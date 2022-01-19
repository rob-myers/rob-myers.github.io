declare namespace NPC {

  export interface NPCsProps {
    defs: NPCDef[];
    onLoad: (api: NPC.NPCsApi) => void;
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

  // OLD
  export interface NPCProps {
    init: NPCDef;
    onLoad: (api: NPC.NPCApi) => void;
  }

  export interface NPCsApi {
    apis: NPCApi[];
    for: Record<string, NPCApi>;
    // ...
  }

  export interface NPCApiNew extends NPCApi {
    el: {
      npc: SVGGElement;
      dir: SVGLineElement;
      path: SVGPolylineElement;
    };
    srcApi: NPC.DraggableNodeApi;
    dstApi: NPC.DraggableNodeApi;
    /** Internal apis */
    _: {
      /** Should cancel drag of node? */
      shouldCancelDrag(curr: Geom.Vect, next: Geom.Vect, type: 'src' | 'dst'): boolean,
      followNavPath(): void;
      /**
       * TODO previously rootRef
       */
      initialize(el: SVGGElement): void;
      onDraggedSrcNode(): void;
      onClickedSrcNode(): void;
      onDraggedDstNode(): void;
      onClickedDstNode(): void;
      reverseNavPath(): void;
      swapNodes(): void;
      togglePaused(): void;
      updateAnimAux(): void;
      /** Compute navpath from NPC's current position to `dst`. */
      updateNavPath(dst: Geom.Vect): void;
    };
  }

  // OLD
  export interface NPCApi {
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
    readonly getPosition: () => Geom.Vect;
    readonly is: (ps: AnimationPlayState) => boolean;
    readonly pause: () => void;
    readonly play: () => void;
  }

  export interface DraggableNodeApi {
    readonly moveTo: (p: Geom.VectJson) => void;
    readonly getPosition: () => Geom.Vect;
  }

  export type IconKey = (
    | 'eye'
    | 'down'
    | 'right'
    | 'run'
    | 'finish'
  );

}
