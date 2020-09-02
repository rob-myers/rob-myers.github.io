import { PerspectiveCamera } from 'three';
import { useRef, useMemo } from 'react';
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from '@model/three/controls';
import { getWindow } from '@model/dom.model';
import { Coord3 } from '@model/three/three.model';
import Grid from './grid';
import Room from './room';
import css from './3d.scss';

// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC = () => {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<PanZoomControls>();
  useFrame((_state) => controls.current!.update());
  return <panZoomControls ref={controls} args={[camera, domElement]} />;
};

const Env: React.FC<Props> = ({ high }) => {
  const level = useRef<THREE.Group>(null);
  const scale = useMemo(() => [1, 1, high ? 3 : 1] as Coord3, [high]);
  
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
        {/* <ambientLight color="white" intensity={0.5} /> */}
        {/* <pointLight position={[0, 0, 5]} intensity={1} /> */}
        
        <Grid />

        <group ref={level} scale={scale}>
          <Room is="closet" at={[-4, 0]} high />
          <Room is="junction" />
          <Room is="closet" at={[4, 0]} w />
          
          <Room is="fourway" at={[0, -4]} />
          <Room is="corner" at={[-4, -4]} n />
          <Room is="straight" at={[4, -4]} />
          
          <Room is="straight" at={[0, -8]} s />
        </group>


      </Canvas>
    </div>
  );
};

interface Props {
  high: boolean;
}

export default Env;
