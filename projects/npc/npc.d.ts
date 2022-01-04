declare namespace NPC {

  export type Api = (
    | SoloApi
  );

  export type SoloApi = {
    readonly key: 'solo';
    anim: Animation;
    readonly initPaused: boolean;
    readonly getPosition: () => Geom.VectJson;
    readonly isEnabled: () => boolean;
  }

  export interface DraggableNodeApi {
    moveTo: (p: Geom.VectJson) => void;
  }

}
