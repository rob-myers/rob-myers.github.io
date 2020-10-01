import { useEffect } from "react";
import { useBox } from "@react-three/cannon";
import useEnvStore from "@store/env.store";

const Actor: React.FC<Props> = ({ envName, actorName }) => {
  const [root, api] = useBox(() => ({ mass: 1 }));

  useEffect(() => {
    const director = useEnvStore.getState().director[envName];
    const actor =  director.actor[actorName];
    if (!director || !actor) {
      return console.error(`invalid env name "${envName}" or actor name "${actorName}"`);
    }

    const origMesh = actor.mesh;
    actor.mesh = root.current as THREE.Mesh;
    actor.mesh.geometry = origMesh.geometry;
    actor.mesh.material = origMesh.material;

    actor.physics = api;
    api.position.copy(origMesh.position);
    api.position.subscribe((v) => actor.position.set(v[0], v[1], v[2]));
    api.rotation.subscribe((v) => actor.rotation.set(v[0], v[1], v[2]));

    return () => {
      actor.mesh = origMesh;
      actor.physics = {} as any;
    };
  }, []);

  return (
    <mesh ref={root} />
  );
}

interface Props {
  envName: string;
  actorName: string;
}

export default Actor;
