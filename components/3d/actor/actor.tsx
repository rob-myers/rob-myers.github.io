import { useEffect, useRef } from "react";
import useEnvStore from "@store/env.store";
import useGeomStore from "@store/geom.store";

const Actor: React.FC<Props> = ({ envName, id }) => {
  const root = useRef<THREE.Group>(null);
  const mesh = useRef(null as null | THREE.Mesh);

  useEffect(() => {
    const env = useEnvStore.getState().env[envName];
    const meta =  useGeomStore.getState().actors[id];
    if (!env || !meta) {
      return console.error(`invalid actor id "${id}"`);
    }

    mesh.current = meta.mesh.clone();
    root.current?.add(mesh.current);
  }, []);

  return (
    <group
      ref={root}    
    />
  );
}

interface Props {
  id: string;
  envName: string;
}

export default Actor;
