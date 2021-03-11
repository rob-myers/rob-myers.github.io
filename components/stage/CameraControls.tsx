import { useRef, useMemo, useEffect } from 'react';
import { extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from 'model/3d/pan-zoom-controls';
import { NewPanZoomControls } from 'model/3d/new-controls';
import useStageStore from 'store/stage.store';

// See types/react-three-fiber/three-types.d.ts
// extend({ PanZoomControls });
extend({ PanZoomControls: NewPanZoomControls });

const CameraControls: React.FC<Props> = ({ stageKey, enabled }) => {

  // const controls = useRef<PanZoomControls>();
  const controls = useRef<NewPanZoomControls>();
  const { camera, gl: { domElement } } = useThree();

  // Prevent re-render to avoid running camera.lookAt twice
  const panZoomControls = useMemo(() => (
    <panZoomControls
      ref={controls}
      args={[camera, domElement]}
      enabled={enabled}
    />
  ), [enabled]);

  useFrame((_state) => controls.current!.update());

  useEffect(() => {
    useStageStore.api.updateStage(stageKey, {
      controls: controls.current!,
    });
  }, []);

  return panZoomControls;
};

interface Props {
  stageKey: string;
  enabled: boolean;
}

export default CameraControls;