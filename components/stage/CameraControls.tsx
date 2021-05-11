import { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from '@react-three/fiber';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import { StageRoot } from 'model/stage/stage.model';

// See types/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC<Props> = ({ root, enabled }) => {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<PanZoomControls>();

  useEffect(() => {
    root.ctrl = controls.current!;
    return () => { delete root.ctrl };
  }, []);

  useFrame((_state) => controls.current!.update());

  return (
    <panZoomControls
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
