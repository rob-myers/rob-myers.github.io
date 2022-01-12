declare namespace NPC {

  export type Api = (
    | SoloApi
  );

  export type SoloApi = {
    readonly key: 'solo';
    anim: Animation;
    /** The path which induces the animation */
    animPath: Geom.Vect[];
    /** How many times has a new animation been created? */
    animCount: number;
    /** Should the first animation be initially paused? */
    readonly initPaused: boolean;
    readonly getPath: () => Geom.Vect[];
    readonly getPosition: () => Geom.VectJson;
    readonly getVisited: () => Geom.VectJson[];
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
