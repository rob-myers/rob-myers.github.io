import useEnvStore from "@store/env.store";

class WorldService {

  setCameraFree(envKey: string) {
    const { camControls } = useEnvStore.getState().env[envKey];
    // console.log('camControls', camControls);
    camControls.enabled = true;
    camControls.camera?.parent?.remove(camControls.camera);
  }

  setCameraFollow(envKey: string, actorName: string) {
    const { camControls } = useEnvStore.getState().env[envKey];
    // console.log('camControls', camControls);
    camControls.enabled = false;
    const { actor } = useEnvStore.getState().director[envKey];
    actor[actorName]?.steerable.group.add(camControls.camera);
  }

}

export const worldService = new WorldService;
