import { range } from 'model/generic.model';
import { NumberKeyframeTrack, AnimationClip } from 'three';

class AnimService {
  
  /** Testing */
  fadeInOutClip() {
    const times = range(20);
    const values = times.map(x => x < 10 ? 0.1 + 0.1 * (x / 10) : 0.2 - 0.1 * ((x - 10) / 10))
    const opacityKF = new NumberKeyframeTrack('.material.opacity', times, values);
    return new AnimationClip('fade-in-out', -1, [
      opacityKF,
    ]);
  }

}

export const animService = new AnimService;
