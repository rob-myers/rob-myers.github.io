import { PerspectiveCamera } from 'three';
import { useRef } from 'react';
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from '@model/three/controls';
import Grid from './grid';
import LoadRooms from './load-rooms';
import css from './3d.scss';
import { getWindow } from '@model/dom.model';
import Room from './room';

// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC = () => {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<PanZoomControls>();
  useFrame((_state) => controls.current!.update());
  return <panZoomControls ref={controls} args={[camera, domElement]} />;
};

const Env: React.FC = () => {
  return (
    <div
      className={css.root}
      style={{ height: 400 }}
    >
      <Canvas
        pixelRatio={getWindow()?.devicePixelRatio}
        onCreated={(ctxt) => {
          const camera = ctxt.camera as PerspectiveCamera;
          camera.position.set(0, 0, 10);
          camera.setFocalLength(30);
        }}
      >
        <CameraControls />
        <ambientLight color="white" intensity={0.5} />
        <pointLight position={[0, 0, 5]} intensity={1} />
        
        <Grid />
        {/* <LoadRooms /> */}
        <Room name="junction" to="n" />
        <Room name="closet" at={[4, 0]} to="w" />
        <Room name="straight" at={[0, 4]} to="n" />

      </Canvas>
    </div>
  );
};

export default Env;
