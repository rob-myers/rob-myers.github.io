import { useEffect } from "react";
import { useBox } from "@react-three/cannon";
import { ActorMeta } from "@model/env/env.store.model";
// import useEnvStore from "@store/env.store";

const Actor: React.FC<Props> = ({ actor, index }) => {
  const [root, api] = useBox(() => ({
    allowSleep: true,
    /**
     * Don't want actors to collide.
     * Do want `Dynamic` body, so:
     * - can move via forces (not just velocity).
     * - can collide actor with static trigger.
     */
    collisionFilterGroup: index,
  }));

  useEffect(() => {
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
    <mesh
      ref={root}
      material={actor.mesh.material}
      geometry={actor.mesh.geometry}
    />
  );
}

interface Props {
  actor: ActorMeta;
  /** Used to prevent actor collisions */
  index: number;
}

export default Actor;
