import { useRef, useMemo } from 'react';
import { extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from '@model/three/controls';

// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC = () => {
  const controls = useRef<PanZoomControls>();
  const { camera, gl: { domElement } } = useThree();

  // Prevent re-render to avoid running camera.lookAt twice
  const panZoomControls = useMemo(() => (
    <panZoomControls
      ref={controls}
      args={[camera, domElement]}
    />
  ), []);

  useFrame((_state) => controls.current!.update());

  return panZoomControls;
};

export default CameraControls;
