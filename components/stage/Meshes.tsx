import { useEffect, useRef } from "react";
import * as THREE from "three";
import { StageMeta } from "model/stage/stage.model";

const Meshes: React.FC<Props> = ({ mesh }) => {
  const groupRef = useRef<THREE.Group>(null); 

  useEffect(() => {
    const meshRoot = groupRef.current!;
    const lookup = { ...mesh };

    meshRoot.children.forEach(mesh => {
      if (!lookup[mesh.userData.key]) {
        meshRoot.remove(mesh);
      } else {
        delete lookup[mesh.userData.key];
      }
    });

    Object.values(lookup).forEach(({ key, mesh }) => {
      mesh.userData.key = key;
      meshRoot.add(mesh);
    });
  }, [mesh]);

  return (
    <group
      ref={groupRef}
      name="MeshRoot"
    />
  );
};

interface Props {
  mesh: StageMeta['mesh'];
}

export default Meshes;
