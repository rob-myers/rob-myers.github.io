declare namespace NPC {

  export interface Props {
    init: {
      src: Geom.VectJson;
      dst: Geom.VectJson;
      zoneKey: string;
    };
    onLoad: (api: NPC.Api) => void;
  }

  export interface Api {
    anim: Animation;
    geom: {
      /** Full navigation path */
      navPath: Geom.Vect[];
      /**
       * Subpath which induces the animation,
       * e.g. when reverse after partial traversal.
       */
      animPath: Geom.Vect[];
    };
    aux: {
      /** How many times has a new animation been created? */
      count: number;
      edges: ({ p: Geom.Vect; q: Geom.Vect })[];
      elens: number[];
      sofars: number[];
      total: number;
    };
    readonly getPosition: () => Geom.Vect;
  }


  // OLD BELOW
  export type SoloApi = {
    readonly key: 'solo';
    anim: Animation;
    /** The path which induces the animation */
    path: Geom.Vect[];
    data: {
      /** How many times has a new animation been created? */
      count: number;
      edges: ({ p: Geom.Vect; q: Geom.Vect })[];
      elens: number[];
      sofars: number[];
      total: number;
    };
    /** Should the first animation be initially paused? */
    readonly initPaused: boolean;
    readonly getPath: () => Geom.Vect[];
    readonly getPosition: () => Geom.Vect;
    readonly getVisited: () => Geom.Vect[];
    readonly isPaused: () => boolean;
    readonly isFinished: () => boolean;
    readonly isPlaying: () => boolean;
    readonly setPath: (path: Geom.Vect[]) => void;
    readonly togglePaused: () => void;
  }

  export interface DraggableNodeApi {
    readonly moveTo: (p: Geom.VectJson) => void;
    readonly getPosition: () => Geom.Vect;
  }

}
