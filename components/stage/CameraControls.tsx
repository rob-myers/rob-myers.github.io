import { useEffect } from 'react';
import { extend, useFrame, useThree,  } from '@react-three/fiber';
import { Controls } from 'model/3d/controls';

// Types must also be extended, see types/three-types.d.ts
extend({ Controls });

const CameraControls: React.FC<Props> = ({ controls, captureMouse }) => {
  const { camera, size } = useThree();

  useEffect(() => {
    controls && (controls.capturePanZoom = captureMouse);
  }, [captureMouse]);

  // From react-three-fiber packages/fiber/src/core/store.ts
  useEffect(() => {
    if (camera.type === 'OrthographicCamera') {
      camera.left = size.width / -2;
      camera.right = size.width / 2;
      camera.top = size.height / 2;
      camera.bottom = size.height / -2;
    } else {
      camera.aspect = size.width / size.height;
    }
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }, [size]);

  useFrame((_state) => controls.update());

  return null;
};

interface Props {
  controls: Controls;
  captureMouse: boolean;
}

export default CameraControls;
