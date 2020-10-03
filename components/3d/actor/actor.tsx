import { useEffect, useRef, useState } from "react";
import { ActorMeta } from "@model/env/env.store.model";
import { Steerable } from "@model/env/steerable";
import * as threeUtil from '@model/three/three.model';
import useGeomStore from "@store/geom.store";

const Actor: React.FC<Props> = ({ actor }) => {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const [, setReady] = useState(false);

  useEffect(() => {
    const { geometry, material } = useGeomStore.api.createActor(actor.key);
    actor.mesh = mesh.current!;
    actor.mesh.geometry = geometry;
    actor.mesh.material = material;
    
    const grp = group.current!;
    grp.position.copy(actor.lastSpawn);
    actor.steerable = new Steerable(grp);
    actor.steerable.setBounds(threeUtil.getBounds(actor.mesh));

    setReady(true); // Trigger re-render
  }, []);

  return (
    <group ref={group}>
      <mesh
        ref={mesh}
        material={actor.mesh.material}
        geometry={actor.mesh.geometry}
      />
    </group>
  );
}

interface Props {
  actor: ActorMeta;
}

export default Actor;
