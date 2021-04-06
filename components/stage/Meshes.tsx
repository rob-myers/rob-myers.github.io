import { useEffect, useState } from "react";
import * as THREE from "three";
import { StageInternal, StageMeta } from "model/stage/stage.model";
import { ensureChildGroup } from "model/3d/three.model";

const Meshes: React.FC<Props> = ({ internal, mesh }) => {
  const [meshRoot, setMeshRoot] = useState<THREE.Group>();

  useEffect(() => {
    if (internal.scene) {// ensure THREE.Group 'MeshRoot'
      setMeshRoot(ensureChildGroup(internal.scene, 'MeshRoot'));
    }
  }, [internal.scene]);

  useEffect(() => {
    if (meshRoot) {// ensure meshes are un/mounted in scene
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
    }
  }, [meshRoot, mesh]);

  return null
};

interface Props {
  internal: StageInternal;
  mesh: StageMeta['mesh'];
}

export default Meshes;
