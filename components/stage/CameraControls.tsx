import { useRef, useMemo, useEffect } from 'react';
import { extend, useThree, useFrame } from 'react-three-fiber';
import { PanZoomControls } from 'model/3d/controls';
import useStageStore from 'store/stage.store';

// See types/react-three-fiber/three-types.d.ts
extend({ PanZoomControls });

const CameraControls: React.FC<Props> = ({ stageKey, enabled }) => {

  const controls = useRef<PanZoomControls>();
  const { camera, gl: { domElement } } = useThree();

  // Prevent re-render to avoid running camera.lookAt twice
  const panZoomControls = useMemo(() => (
    <panZoomControls
      ref={controls}
      args={[camera, domElement]}
    />
  ), []);

  useFrame((_state) => enabled && controls.current!.update());

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