import { PerspectiveCamera } from 'three';
import { useRef } from 'react';
import { Canvas, extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from '@model/three/controls';
import { getWindow } from '@model/dom.model';
import Grid from './grid';
import Room from './room';
import css from './world.scss';

const World: React.FC<Props> = ({ envName }) => {
  const level = useRef<THREE.Group>(null);
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);

  return (
    <div
      className={css.root}
    >
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
        {/* <pointLight position={[0, 0, 5]} intensity={1} /> */}
        
        <Grid />

        <group
          ref={level}
          // onUpdate={() => !geomMounted && setGeomMounted(true)}
          userData={{ envName }} // For children
        >ß
          <Room is="closet" x={-4} />
          <Room is="junction" />
          <Room is="closet" x={4} w />
          
          <Room is="fourway" y={-4} />
          <Room is="corner" x={-4} y={-4} n />
          <Room is="straight" x={4} y={-4} />
          
          <Room is="straight" y={-8} s />
        </group>

      </Canvas>
    </div>
  );
};

interface Props {
  envName: string;
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
