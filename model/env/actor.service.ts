import * as THREE from 'three';

import type * as Geom from '@model/geom/geom.model';
import { processService as ps } from '@model/shell/process.service';
import useEnvStore from "@store/env.store";
import { pause } from '@model/generic.model';
import { alphaNumericRegex } from '@model/shell/var.service';
import * as threeUtil from '@model/three/three.model';
import { geomService } from '@model/geom/geom.service';
import { LookStrategy } from './steerable';

class ActorService {
  
  private animCancels = {} as Record<string, () => void>;
  readonly forbiddenNames = {
    camera: true,
  };

  isLegalName(actorName: string) {
    return alphaNumericRegex.test(actorName) && !(actorName in this.forbiddenNames);
  }

  spawn(envKey: string, actorName: string, position: Geom.VectorJson) {
    const director = useEnvStore.getState().director[envKey];
    const actor = director.actor[actorName];

    if (actor) {
      actor.steerable.position.set(position.x, position.y, 0);
      actor.cancelGoto();
    } else {
      useEnvStore.api.createActor(envKey, actorName, position);
    }
  }

  async faceTowardsPoint(opts: {
    envKey: string;
    pid: number;
    actorName: string;
    cb: (err: null | string) => void;
  } & (
    | { mode: 'once'; point: Geom.VectorJson }
    | { mode: 'watch-other-actor'; otherName: string }
    | { mode: 'watch-mouse' }
  )) {
    const { envKey, pid, actorName, cb } = opts;
    const director = useEnvStore.getState().director[envKey];
    const actor = director.actor[actorName];

    // Override any current look for this actor
    const cancelKey = `${actorName}@${envKey}:look`;
    if (cancelKey in this.animCancels) actor.cancelLook();

    let step: () => {};

    switch(opts.mode) {
      case 'once': {
        const delta = actor.steerable.setLookTarget(new THREE.Vector3(opts.point.x, opts.point.y));
        if (Math.abs(delta) < 0.01) {
          return cb(null); // Already facing
        }
        let steps = 0, numSteps = (Math.abs(delta) / Math.PI) * 50;
        step = () => {
          actor.steerable.lookTowards(steps / numSteps);
          return steps++ > numSteps;
        };
        break;
      }
      case 'watch-other-actor': {
        const { steerable } = useEnvStore.getState().director[envKey].actor[opts.otherName];
        step = () => {
          actor.steerable.setLookTarget(steerable.position);
          actor.steerable.lookTowards(0.1);
          return false;
        };
        break;
      }
      case 'watch-mouse': {
        const { position } = useEnvStore.getState().director[envKey].mouse;
        step = () => {
          actor.steerable.setLookTarget(position);
          actor.steerable.lookTowards(0.1);
          return false;
        };
        break;
      }
    }

    actor.steerable.lookStrategy = LookStrategy.controlled;

    try {// Racing handles Ctrl-C or cancellation by another process
      await Promise.race([
        this.animateUntil(step, cancelKey),
        new Promise((_, reject) => {
          ps.addCleanup(pid, reject); // Ctrl-C
          actor.cancelLook = reject;
        }),
      ]);
      cb(null);
    } catch (e) {
      cb(`${opts.mode === 'once' ? 'look' : 'watch'} was cancelled`);
      this.cancelAnimation(cancelKey);
    } finally {
      actor.cancelLook = () => {};
      actor.steerable.lookStrategy = LookStrategy.travel;
    }
  }

  async followPath(
    envKey: string,
    pid: number,
    actorName: string,
    navPath: Geom.VectorJson[],
    cb: (err: null | string) => void,
  ) {
    const director = useEnvStore.getState().director[envKey];
    const actor = director.actor[actorName];

    if (!actor) {
      return cb(`unknown actor "${actorName}": cannot follow path`);
    } else if (navPath.length <= 1) {// 1st is actor's current position
      return cb(null);
    }

    const path = navPath.map(p => new THREE.Vector3(p.x, p.y));
    const steerable = actor.steerable;

    // Override any currently running `goto` for this actor
    const cancelKey = `${actorName}@${envKey}:goto`;
    if (cancelKey in this.animCancels) {
      actor.cancelGoto();
      await pause(100);
    }

    const step = () => {
      if (steerable.followPath(path, false, 0.1)) {
        return true;
      }
      steerable.look();
      steerable.update();
    };

    try {// Racing handles Ctrl-C or cancellation by another process
      await Promise.race([
        this.animateUntil(step, cancelKey),
        new Promise((_, reject) => {
          ps.addCleanup(pid, reject); // Ctrl-C
          actor.cancelGoto = reject;
        }),
      ]);
      cb(null);
    } catch (e) {
      cb('goto was cancelled');
      this.cancelAnimation(cancelKey);
    } finally {
      actor.cancelGoto = () => {};
      steerable.pathIndex = 0;
    }

  }

  /**
   * Animate until `step` returns truthy, or we cancel.
   */
  private async animateUntil(step: () => any, cancelKey: string) {
    let animId = 0;
    try {
      await new Promise((resolve, reject) => {
        this.animCancels[cancelKey] = reject;
        const animate = () =>
          !step() && (animId = requestAnimationFrame(animate)) || resolve();
        animate();
      });
    } finally {
      cancelAnimationFrame(animId);
      delete this.animCancels[cancelKey];
    }
  }

  private cancelAnimation(cancelKey: string) {
    this.animCancels[cancelKey]?.();
    delete this.animCancels[cancelKey];
  }

}

export const actorService = new ActorService;
