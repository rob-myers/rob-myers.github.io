import { useRef } from 'react';
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { Box } from './cubes';
import { PanZoomControls } from './controls';
import css from './three.scss';

// Also see our local types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

type Coord = [number, number, number];
const zero: Coord = [0, 0, 0];
const _one: Coord = [1, 1, 1];

const CameraControls: React.FC = () => {
  const { camera, gl: { domElement }} = useThree();
  const controls = useRef<PanZoomControls>();
  useFrame((_state) => controls.current!.update());
  return <panZoomControls ref={controls} args={[camera, domElement]} />;
};

const PanZoom: React.FC = () => {
  return (
    <group>
      <Box position={zero} />
    </group>
  );
};

const PanZoomRoot: React.FC = () => {
  return (
    <div
      className={css.root}
      style={{ height: 400 }}
    >
      <Canvas>
        <CameraControls />
        <PanZoom />
      </Canvas>
    </div>
  );
};

export default PanZoomRoot;
