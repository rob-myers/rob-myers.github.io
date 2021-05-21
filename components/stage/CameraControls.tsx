import { useEffect } from 'react';
import { extend, useFrame, useThree,  } from '@react-three/fiber';
import { Controls } from 'model/3d/controls';

// Types must also be extended, see types/three-types.d.ts
extend({ Controls });

export default function CameraControls({ controls, captureMouse }: Props) {
  useFrame((_state) => controls.update());

  useEffect(() => {
    controls && (controls.capturePanZoom = captureMouse);
  }, [captureMouse]);

  /**
   * Resize camera on change canvas size.
   * From react-three-fiber packages/fiber/src/core/store.ts
   */
  const { camera, size } = useThree();
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

  return null;
};

interface Props {
  controls: Controls;
  captureMouse: boolean;
}
