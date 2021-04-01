import { useRef, useEffect, useMemo } from 'react';
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

  useEffect(() => {
    if (!stage.internal.controls) {
      useStageStore.api.updateInternal(stage.key, { controls: controls.current! });
    }
  }, [stage.internal]);

  useFrame((_state) => controls.current!.update());

  const actions = useMemo(() => ({
    /** Persist the stage whenever camera stops pan/zoom */
    onStop: () => useStageStore.api.persist(stage.key),
  }), [stage.key]);

  return (
    <panZoomControls
      ref={controls}
      args={[camera, domElement, actions]}
      enabled={enabled}
    />
  );
};

interface Props {
  stage: StageMeta;
}

export default CameraControls;
