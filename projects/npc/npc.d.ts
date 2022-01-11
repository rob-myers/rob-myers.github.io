declare namespace NPC {

  export type Api = (
    | SoloApi
  );

  export type SoloApi = {
    readonly key: 'solo';
    anim: Animation;
    /** How many times has a new animation been created? */
    animCount: nummber;
    /** Should the first animation be initially paused? */
    readonly initPaused: boolean;
    readonly getPosition: () => Geom.VectJson;
    readonly isPaused: () => boolean;
    readonly isFinished: () => boolean;
    readonly isPlaying: () => boolean;
    readonly togglePaused: () => void;
  }

  export interface DraggableNodeApi {
    moveTo: (p: Geom.VectJson) => void;
  }

}
