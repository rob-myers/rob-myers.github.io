import { useEffect, useState } from "react";
import * as THREE from "three";
import { StageMeta } from "model/stage/stage.model";
import { ensureChildGroup } from "model/3d/three.model";

const Meshes: React.FC<Props> = ({ stage }) => {
  const [meshRoot, setMeshRoot] = useState<THREE.Group>();

  useEffect(() => {
    if (stage.internal.scene) {// ensure THREE.Group 'MeshRoot'
      setMeshRoot(ensureChildGroup(stage.internal.scene, 'MeshRoot'));
    }
  }, [stage.internal.scene]);

  useEffect(() => {
    if (meshRoot) {// ensure meshes are un/mounted in scene
      const lookup = { ...stage.mesh };
  
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
    }
  }, [meshRoot, stage.mesh]);

  return null
};

interface Props {
  stage: StageMeta;
}

export default Meshes;
