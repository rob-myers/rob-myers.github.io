import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import React from 'react';
import { useThree } from 'react-three-fiber';
import * as THREE from 'three';
import { isGroupNode, isMeshNode } from '@model/three/three.model';

const Rooms = dynamic(() => import('./gltf/rooms.gltf'), { ssr: false });
const loadedGroupName = 'loaded-rooms-group';
const epsilon = 0.0001;
const setPrecision = (p: THREE.Vector3) =>
  p.multiplyScalar(1000).round().multiplyScalar(1/1000);

const LoadRooms: React.FC = () => {
  const { scene } = useThree();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) {
      const rooms = [] as THREE.Mesh[];
      scene.traverse((node) => {
        if (isGroupNode(node) && node.name === loadedGroupName) {
          node.traverse((x) => {
            if (isGroupNode(x) && x.name === 'rooms') {
              x.updateMatrixWorld();
              x.traverse((roomNode) => isMeshNode(roomNode) && rooms.push(roomNode));
            }
          });
        }
      });
      console.log({ rooms });

      const floorTris = [] as THREE.Vector3[][];
      rooms.forEach((room) => {
        const geom = (new THREE.Geometry()).fromBufferGeometry(room.geometry as THREE.BufferGeometry);
        const vs = geom.vertices.map(p => setPrecision(room.localToWorld(p.clone())));
        geom.faces.forEach(({ a, b, c }) => {
          const tri = [a, b, c].map(i => vs[i]);
          tri.every(p => Math.abs(p.y) < epsilon) && floorTris.push(tri);
        });
      });
      console.log({ floorTris });

    }
  }, [ready]);

  return (
    <group rotation={[Math.PI/2, 0, 0]}>
      <Suspense fallback={<Fallback onUnmount={() => setReady(true)} />} >
        <Rooms name={loadedGroupName} />
      </Suspense>
    </group>
  );
};

const Fallback: React.FC<{ onUnmount: () => void }> = ({ onUnmount }) => {
  useEffect(() => () => onUnmount(), []);
  return null;
};

export default LoadRooms;
