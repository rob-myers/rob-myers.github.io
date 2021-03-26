import { useRef, useMemo, useEffect } from 'react';
import { extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import useStageStore from 'store/stage.store';
import { StageMeta } from 'model/stage/stage.model';

// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC<Props> = ({ stage }) => {
  const { camera, gl: { domElement } } = useThree();
  const enabled = stage.internal.camEnabled;

  const controls = useRef<PanZoomControls>();

  const panZoomControls = useMemo(() => <panZoomControls
    ref={controls}
    args={[camera, domElement]}
    enabled={enabled}
  />, [enabled]);

  useEffect(() => {
    !stage.internal.controls && useStageStore.api
      .updateInternal(stage.key, { controls: controls.current! });
  }, [stage.internal]);

  useFrame((_state) => controls.current!.update());

  return panZoomControls;
};

interface Props {
  stage: StageMeta;
}

export default CameraControls;
