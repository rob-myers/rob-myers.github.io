declare namespace NPC {

  export interface SoloApi {
    anim: Animation;
    isEnabled: () => boolean;
    initPaused: boolean;
  }

}
