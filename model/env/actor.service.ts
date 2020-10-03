import anime from 'animejs';
import { removeFirst } from '@model/generic.model';
import type * as Geom from '@model/geom/geom.model';
import { Vector } from '@model/geom/geom.model';
import { geomService } from '@model/geom/geom.service';
import { processService as ps } from '@model/shell/process.service';
import useEnvStore from "@store/env.store";
import { FollowPath } from './world.device';

class ActorService {

  spawn(envKey: string, actorName: string, position: Geom.VectorJson) {
    const director = useEnvStore.getState().director[envKey];
    const actor = director.actor[actorName];

    if (actor) {
      actor.mesh.position.set(position.x, position.y, 0);
    } else {
      useEnvStore.api.createActor(envKey, actorName, position);
    }
  }

  /**
   * @deprecated
   */
  async followPath(
    envKey: string,
    pid: number,
    actorName: string,
    navPath: Geom.VectorJson[],
    cb: FollowPath['callback'],
  ) {
    const director = useEnvStore.getState().director[envKey];
    const actor = director.actor[actorName];

    if (!actor) {
      return cb(`unknown actor "${actorName}": cannot follow path`);
    } else if (navPath.length <= 1) {
      return cb(null);
    }

    const path = navPath.map(p => new Vector(p.x, p.y));
    const moving = !actor.timeline.finished;

    if (moving) {
      actor.timeline.pause();
      actor.cancel();
    }

    const mesh = actor.mesh;
    const position = path[0].clone();
    const rotation = { angle: geomService.ensureDeltaRad(mesh.rotation.z) };

    // const { physics } = actor;
    actor.timeline = anime.timeline({
      targets: position,
      easing: 'linear',
      update: () => {// NOTE we're clamping height
        mesh.position.set(position.x, position.y, 0);
      },
    });

    const baseRotate: anime.AnimeParams = {
      targets: rotation,
      duration: 200,
      update: () => mesh.rotation.set(0, 0, rotation.angle),
    };

    let totalMs = 0, delta = Vector.zero;
    path.slice(1).forEach((target, i) => {
      delta.copy(target).sub(path[i]);
      const deltaMs = 600 * delta.length;

      if (i === 0) {
        actor.timeline.add({ ...baseRotate, angle: delta.angle, duration: 200 });
        totalMs += 200;
      }

      // Move towards `target` after previous move
      actor.timeline.add({ x: target.x, y: target.y, duration: deltaMs });
      if (i) {
        // At `totalMs` (absolute offset) rotate towards `delta.angle`
        actor.timeline.add({ ...baseRotate, angle: delta.angle, duration: 100 }, totalMs);
      }

      totalMs += deltaMs;
    });

    try {
      // We race to handle Ctrl-C and cancellation by other process
      await Promise.race([
        actor.timeline.finished,
        new Promise((_, reject) => {
          ps.addCleanups(pid, reject);
          actor.cancel = reject;
        }),
      ]);
      cb(null);
    } catch (e) {
      actor.timeline.pause(); // TODO dispose animations?
      cb(`${actorName}: goto was cancelled`);
    } finally {
      actor.cancel = () => {};
    }
  }


  /** https://github.com/juliangarnier/anime/issues/188#issuecomment-621589326 */
  private cancelAnimation (animation: anime.AnimeInstance) {
    removeFirst(anime.running, animation);
    animation.pause();
  }

}

export const actorService = new ActorService;
