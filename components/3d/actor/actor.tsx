import { useEffect, useRef, useState } from "react";
import { ActorMeta } from "@model/env/env.store.model";
import useGeomStore from "@store/geom.store";
import { Steerable } from "@model/env/steerable";

const Actor: React.FC<Props> = ({ actor }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [, setReady] = useState(false);

  useEffect(() => {
    const { geometry, material } = useGeomStore.api.createActor(actor.key);
    actor.mesh = mesh.current!;
    actor.mesh.geometry = geometry;
    actor.mesh.material = material;
    actor.mesh.position.copy(actor.lastSpawn);

    actor.steerable = new Steerable(actor.mesh);

    setReady(true); // Trigger re-render
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
