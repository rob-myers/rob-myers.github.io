import { Suspense, useEffect, useState } from 'react';
import React from 'react';
import { useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { isGroupNode, isMeshNode } from '@model/three/three.model';
import { Vector2 } from 'three';

const wallsGroupName = 'Walls';

/**
 * Its children should be dynamically loaded gltf component(s).
 */
const Transformer: React.FC<Props> = ({ children, groupNames }) => {
  const { scene } = useThree();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) {
      // Find walls
      const walls = [] as THREE.Mesh[];
      scene.traverse((node) => {
        if (isGroupNode(node) && groupNames.includes(node.name)) {
          node.traverse((x) => {
            if (isGroupNode(x) && x.name === wallsGroupName) {
              console.log('Found walls', x);
              x.traverse((wallNode) => isMeshNode(wallNode) && walls.push(wallNode));
            }
          });
        }
      });
      console.log({ walls });

      // Find floorTris for navpoly
      const floorTris = [] as THREE.Vector2[][];
      const tmpGeom = new THREE.Geometry();
      const tmpVec = new THREE.Vector3();
      const tmpMat = new THREE.Matrix3();
      
      walls.map(wall => tmpGeom
        .fromBufferGeometry(wall.geometry as THREE.BufferGeometry))
        .forEach((geom, i) => {
          const mesh = walls[i];
          mesh.updateMatrixWorld();
          geom.vertices.map(p => mesh.localToWorld(p)); // Mutates them
          
          tmpMat.getNormalMatrix(mesh.matrixWorld);
          geom.faces.forEach(({ normal, a, b, c }) => {
            tmpVec.copy(normal).applyMatrix3(tmpMat).normalize();
            if (tmpVec.y === -1 && geom.vertices[a].y === 0) {
              const tri = [a, b, c].map(i => geom.vertices[i]);
              // console.log(tri);
              floorTris.push(tri.map(v => new Vector2(v.x, v.z))); // or -v.z?
            }
          });
        });
      console.log({ floorTris });
    }
  }, [ready]);

  return (
    <group rotation={[Math.PI/2, 0, 0]}>
      <Suspense fallback={<Fallback onUnmount={() => setReady(true)} />} >
        {React.Children.map((children), (child, i) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { name: groupNames[i] })
            : null
        )}
      </Suspense>
    </group>
  );
};

interface Props {
  groupNames: string[];
}

const Fallback: React.FC<{ onUnmount: () => void }> = ({ onUnmount }) => {
  useEffect(() => () => onUnmount(), []);
  return null;
};

export default Transformer;