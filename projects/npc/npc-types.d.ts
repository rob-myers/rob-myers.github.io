declare namespace NPC {

  export interface Props {
    deps: {
      lines: SVGGElement;
    };
    init: {
      key: string;
      src: Geom.VectJson;
      dst: Geom.VectJson;
      angle: number;
      zoneKey: string;
      paused: boolean;
    };
    onLoad: (api: NPC.Api) => void;
  }

  export interface Api {
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
