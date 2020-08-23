import { Suspense, useEffect, useState } from 'react';
import React from 'react';
import { useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { isGroupNode, isMeshNode } from '@model/three/three.model';

const wallsGroupName = 'Walls';

/**
 * Its children should be dynamically loaded gltf component(s).
 */
const Transformer: React.FC<Props> = ({ children, groupNames }) => {
  const { scene } = useThree();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) {
      const walls = [] as THREE.Mesh[];
      const emptyGeometry = new THREE.Geometry();

      scene.traverse((node) => {
        if (isGroupNode(node) && groupNames.includes(node.name)) {
          node.traverse((x) => {
            if (isGroupNode(x) && x.name === wallsGroupName) {
              console.log('Found walls', x);
              /**
               * TODO compute navpoly
               * TODO stretch height for high walls
               * We'll BufferGeometry -> Geometry, edit it, then convert back.
               */
              x.traverse((wallNode) => isMeshNode(wallNode) && walls.push(wallNode));
              console.log({
                walls,
                geometries: walls.map(wall => emptyGeometry.fromBufferGeometry(wall.geometry as THREE.BufferGeometry)),
              });
            }
          });
        }
      });
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