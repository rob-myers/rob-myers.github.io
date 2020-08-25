import { useRef } from 'react';
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from '@model/three/controls';
import { PerspectiveCamera } from 'three';
import Grid from '@components/three/grid';
import GeomLoader from '@components/three/geom-loader';
import css from './three.scss';


// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC = () => {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<PanZoomControls>();
  useFrame((_state) => controls.current!.update());
  return <panZoomControls ref={controls} args={[camera, domElement]} />;
};

const PanZoom: React.FC = () => {
  return (
    <>
      <Grid />
      <GeomLoader />
    </>
  );
};

const PanZoomRoot: React.FC = () => {
  return (
    <div
      className={css.root}
      style={{ height: 400 }}
    >
      <Canvas
        pixelRatio={window.devicePixelRatio}
        onCreated={(ctxt) => {
          const camera = ctxt.camera as PerspectiveCamera;
          camera.position.set(0, 0, 10);
          camera.setFocalLength(30);
        }}
      >
        <CameraControls />
        <ambientLight color="white" intensity={0.5} />
        <pointLight position={[0, 0, 5]} intensity={1} />
        <PanZoom />
      </Canvas>
    </div>
  );
};

export default PanZoomRoot;
