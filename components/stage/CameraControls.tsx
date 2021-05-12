import { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from '@react-three/fiber';
import { CustomControls } from 'model/3d/custom-controls';
import { StageRoot } from 'model/stage/stage.model';

// See types/three-types.d.ts
extend({ CustomControls });

const CameraControls: React.FC<Props> = ({ root, enabled }) => {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<CustomControls>();

  useEffect(() => {
    root.ctrl = controls.current!;
    root.ctrl.maxPolarAngle = Math.PI / 4;
    [root.ctrl.minZoom, root.ctrl.maxZoom] = [5, 80];
    [root.ctrl.minDistance, root.ctrl.maxDistance] = [2, 20];
    return () => { delete root.ctrl };
  }, []);

  useFrame((_state) => controls.current!.update());

  return (
    <customControls
      ref={controls}
      args={[camera, domElement]}
      enabled={enabled}
    />
  );
};

interface Props {
  root: StageRoot;
  enabled: boolean;
}

export default CameraControls;
