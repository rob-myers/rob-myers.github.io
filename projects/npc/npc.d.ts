declare namespace NPC {

  export interface SoloApi {
    anim: Animation;
    isEnabled: () => boolean;
    readonly initPaused: boolean;
  }

}
