import { useEffect, useRef } from "react";
import { ActorMeta } from "@model/env/env.store.model";

const Actor: React.FC<Props> = ({ actor }) => {
  const mesh = useRef<THREE.Mesh>(null);

  useEffect(() => {
    /**
     * TODO provide base mesh to copy geometry/material from
     */
    const origMesh = actor.mesh;
    actor.mesh = mesh.current as THREE.Mesh;
    actor.mesh.geometry = origMesh.geometry;
    actor.mesh.material = origMesh.material;
    actor.mesh.position.copy(origMesh.position);  

    return () => {
      actor.mesh = origMesh;
    };
  }, []);

  return (
    <mesh
      ref={mesh}
      material={actor.mesh.material}
      geometry={actor.mesh.geometry}
    />
  );
}

interface Props {
  actor: ActorMeta;
}

export default Actor;
