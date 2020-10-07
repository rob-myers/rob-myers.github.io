import { useRef, useMemo, useEffect } from 'react';
import { extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from '@model/three/controls';
import useEnvStore from '@store/env.store';

// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC<Props> = ({ envName }) => {
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

  useEffect(() => {
    useEnvStore.api.storeCamControls(envName, controls.current!);
  }, []);

  return panZoomControls;
};

interface Props {
  envName: string;
}

export default CameraControls;
