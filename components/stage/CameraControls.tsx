import { useEffect } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { Controls } from 'model/3d/controls';

// Types must also be extended, see types/three-types.d.ts
extend({ Controls });

const CameraControls: React.FC<Props> = ({ controls, captureMouse }) => {
  useEffect(() => {
    controls && (controls.capturePanZoom = captureMouse);
  }, [captureMouse]);

  useFrame((_state) => controls.update());

  return null;
};

interface Props {
  controls: Controls;
  captureMouse: boolean;
}

export default CameraControls;
