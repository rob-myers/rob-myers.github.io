import useEnvStore from "@store/env.store";

class WorldService {

  setCameraFree(envKey: string) {
    const { camControls } = useEnvStore.getState().env[envKey];
    camControls.targetObject = null;
  }

  setCameraFollow(envKey: string, actorName: string) {
    const { camControls } = useEnvStore.getState().env[envKey];
    const { actor } = useEnvStore.getState().director[envKey];
    camControls.targetObject = actor[actorName].mesh.parent!;
  }

}

export const worldService = new WorldService;
