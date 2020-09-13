import { PerspectiveCamera } from 'three';
import { useRef, useEffect, useState } from 'react';
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from '@model/three/controls';
import { getWindow } from '@model/dom.model';
import useGeomStore from '@store/geom.store';
import Grid from './grid';
import { Closet, Corner, Fourway, Junction, Straight } from './rooms';
import Inner from './rooms/inner';
import css from './world.scss';
import { isMeshNode } from '@model/three/three.model';

const World: React.FC<Props> = ({ envName, highWalls }) => {
  const level = useRef<THREE.Group>(null);
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const loadedGltf = useGeomStore(({ loadedGltf }) => loadedGltf);

  useEffect(() => {
    const metas = useGeomStore.getState().rooms;
    level.current?.traverse((o) => (o.name in metas && isMeshNode(o)) &&
      (o.geometry = metas[o.name][highWalls ? 'highMesh' : 'mesh'].geometry));
  }, [highWalls]);

  return (
    <div
      className={css.root}
    >
      {loadedGltf &&
        <Canvas
          pixelRatio={pixelRatio.current}
          onCreated={(ctxt) => {
            const camera = ctxt.camera as PerspectiveCamera;
            camera.position.set(0, 0, 10);
            camera.setFocalLength(30);
          }}
        >
          <CameraControls />
          {/* <ambientLight color="white" intensity={0.5} /> */}
          <pointLight position={[0, 0, 5]} intensity={1} />
          
          <Grid />

          <group
            ref={level}
            // onUpdate={() => !geomMounted && setGeomMounted(true)}
            userData={{ envName }} // For children
          >
            <Closet x={-4}>
              <Inner id="sideboard" />  
            </Closet>
            <Junction>
              <Inner id="central-table" />  
            </Junction>
            <Closet x={4} w>
              <Inner id="sideboard" />  
            </Closet>
            
            <Fourway y={-4} />
            <Corner x={-4} y={-4} n />
            <Straight x={4} y={-4} />
            
            <Straight y={-8} s />
          </group>

        </Canvas>
      }
    </div>
  );
};

interface Props {
  envName: string;
  highWalls: boolean;
}

// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC = () => {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<PanZoomControls>();
  useFrame((_state) => controls.current!.update());
  return <panZoomControls ref={controls} args={[camera, domElement]} />;
};

export default World;
