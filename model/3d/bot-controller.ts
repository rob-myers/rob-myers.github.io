import * as THREE from 'three';
import { range } from 'model/generic.model';

export class BotController {

  public mixer: THREE.AnimationMixer;

  constructor(
    private group: THREE.Group,
    private clips: THREE.AnimationClip[],
  ) {
    this.mixer = new THREE.AnimationMixer(group);
  }

  /** Testing */
  fadeInOutClip() {
    const times = range(20);
    const values = times.map(x => x < 10 ? 0.1 + 0.1 * (x / 10) : 0.2 - 0.1 * ((x - 10) / 10))
    const opacityKF = new THREE.NumberKeyframeTrack('.material.opacity', times, values);
    return new THREE.AnimationClip('fade-in-out', -1, [opacityKF]);
  }
}
