import useEnvStore from "@store/env.store";

class WorldService {

  setCameraFree(envKey: string) {
    const { camControls } = useEnvStore.getState().env[envKey];
    camControls.noPan = false;
    camControls.targetObject = null;
  }

  setCameraFollow(envKey: string, actorName: string) {
    const { camControls } = useEnvStore.getState().env[envKey];
    camControls.noPan = true;
    const { actor } = useEnvStore.getState().director[envKey];
    camControls.targetObject = actor[actorName].mesh.parent!;
  }

}

export const worldService = new WorldService;
