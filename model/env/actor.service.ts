import anime from 'animejs';
import type * as Geom from '@model/geom/geom.model';
import { Vector } from '@model/geom/geom.model';
import { geomService } from '@model/geom/geom.service';
import { processService as ps } from '@model/shell/process.service';
import useGeomStore from "@store/geom.store";
import useEnvStore from "@store/env.store";
import { FollowPath } from './world.device';

class ActorService {

  spawn(envKey: string, actorName: string, position: Geom.VectorJson) {
    const director = useEnvStore.getState().director[envKey];
    if (actorName in director.toMesh) {
      geomService.moveToXY(director.toMesh[actorName], position);
    } else {
      const mesh = useGeomStore.api.createActor(position, actorName);
      director.actorsGrp.add(mesh);
      director.toMesh[actorName] = mesh;
    }
  }

  async followPath(
    envKey: string,
    pid: number,
    actorName: string,
    navPath: Geom.VectorJson[],
    cb: FollowPath['callback'],
  ) {
    const director = useEnvStore.getState().director[envKey];

    if (!(actorName in director.toMesh)) {
      return cb(`unknown actor "${actorName}" cannot follow path`);
    } else if (navPath.length <= 1) {
      return cb(null);
    }

    // Cancel any currently running timeline
    if (actorName in director.toCancel) {
      director.toCancel[actorName]();
    }

    const mesh = director.toMesh[actorName];
    const path = navPath.map(p => new Vector(p.x, p.y));
    const position = path[0].clone();

    // TODO rotation via absolute offsets (just before turn)
    // No need for easing though

    const timeline = anime.timeline({
      targets: position,
      easing: 'linear',
      update: () => geomService.moveToXY(mesh, position),
    });
    path.slice(1).forEach((target, i) => timeline.add({
      x: target.x,
      y: target.y,
      duration: 600 * path[i].distTo(target),
      easing: 'linear',
    }));

    try {
      // We race to handle Ctrl-C and cancellation by other process
      await Promise.race([
        timeline.finished,
        new Promise((_, reject) => {
          ps.addCleanups(pid, reject);
          director.toCancel[actorName] = reject;
        }),
      ]);
      cb(null);
    } catch (e) {
      timeline.pause(); // TODO dispose animations?
      cb(`${actorName}: goto was cancelled`);
    } finally {
      delete director.toCancel[actorName];
    }
  }

}

export const actorService = new ActorService;
