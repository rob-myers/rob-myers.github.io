import * as THREE from 'three';

import type * as Geom from '@model/geom/geom.model';
import { processService as ps } from '@model/shell/process.service';
import useEnvStore from "@store/env.store";
import { pause } from '@model/generic.model';
import { alphaNumericRegex } from '@model/shell/var.service';
import * as threeUtil from '@model/three/three.model';
import { geomService } from '@model/geom/geom.service';


class ActorService {
  
  private animCancels = {} as Record<string, () => void>;
  private forbiddenNames = {
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
      actor.cancel();
    } else {
      useEnvStore.api.createActor(envKey, actorName, position);
    }
  }

  async faceTowardsPoint(
    envKey: string,
    pid: number,
    actorName: string,
    point: Geom.VectorJson,
    cb: (err: null | string) => void,
  ) {
    const director = useEnvStore.getState().director[envKey];
    const actor = director.actor[actorName];

    const rect = geomService.projectBox3XY(threeUtil.getBounds(actor.mesh));
    if (rect.contains(point)) {
      return cb(null); // Actor cannot face itself
    }

    cb('unimplemented');
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

    const cancelKey = `${actorName}@${envKey}`;
    if (cancelKey in this.animCancels) {
      actor.cancel();
      await pause(100);
    }

    const step = () => {
      if (steerable.followPath(path, false, 0.1)) {
        return true;
      }
      steerable.lookWhereGoing(true);
      steerable.update();
    };

    try {
      // Racing handles Ctrl-C or cancellation by another process
      await Promise.race([
        this.animateUntil(step,cancelKey),
        new Promise((_, reject) => {
          ps.addCleanup(pid, reject); // Ctrl-C
          actor.cancel = reject;
        }),
      ]);
      cb(null);
    } catch (e) {
      cb(`${actorName}: goto was cancelled`);
      this.cancelAnimation(cancelKey);
    } finally {
      actor.cancel = () => {};
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
