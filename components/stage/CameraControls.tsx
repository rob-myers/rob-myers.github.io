import { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import useStage from 'store/stage.store';
import { StageMeta } from 'model/stage/stage.model';

// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC<Props> = ({ stage }) => {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<PanZoomControls>();

  useEffect(() => {
    useStage.api.updateInternal(stage.key, { controls: controls.current! });
    return () => void delete stage.internal.controls;
  }, []);

  useFrame((_state) => controls.current!.update());

  return (
    <panZoomControls
      ref={controls}
      args={[camera, domElement]}
      enabled={stage.opts.panZoom}
    />
  );
};

interface Props {
  stage: StageMeta;
}

export default CameraControls;
