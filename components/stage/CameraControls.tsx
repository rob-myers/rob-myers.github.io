import { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import { StageInternal } from 'model/stage/stage.model';

// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC<Props> = ({ internal, enabled }) => {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<PanZoomControls>();

  useEffect(() => {
    internal.controls = controls.current!;
    return () => void delete internal.controls;
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
  internal: StageInternal;
  enabled: boolean;
}

export default CameraControls;
