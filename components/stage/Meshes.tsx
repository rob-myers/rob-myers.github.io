import { useEffect, useRef } from "react";
import * as THREE from "three";
import { StageMeta } from "model/stage/stage.model";

const Meshes: React.FC<Props> = ({ mesh, updateShadows }) => {
  const groupRef = useRef<THREE.Group>(null); 

  useEffect(() => {
    const meshRoot = groupRef.current!;
    const lookup = { ...mesh };

    // Must slice because .remove() splices
    meshRoot.children.slice().forEach(mesh => {
      if (!lookup[mesh.uuid]) {
        // Remove if no longer in lookup
        meshRoot.remove(mesh);
      } else {// Can ignore because already exists
        delete lookup[mesh.uuid];
      }
    });

    Object.values(lookup).forEach(({ mesh }) => {
      meshRoot.add(mesh); // Add new
      mesh.castShadow = true;
    });

    updateShadows();
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
  updateShadows: () => void;
}

export default Meshes;
