import { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from '@react-three/fiber';
import { Controls } from 'model/3d/controls';

// See types/three-types.d.ts
extend({ Controls });

const CameraControls: React.FC<Props> = ({ setStageCtrl, captureMouse }) => {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<Controls>();

  useEffect(() => {
    const ctrl = controls.current!;
    setStageCtrl(ctrl);

    ctrl.maxPolarAngle = Math.PI / 4;
    [ctrl.minZoom, ctrl.maxZoom] = [5, 80];
    [ctrl.minDistance, ctrl.maxDistance] = [2, 20];
    ctrl.screenSpacePanning = false;

    return () => setStageCtrl();
  }, []);

  useEffect(() => {
    controls.current && (controls.current.capturePanZoom = captureMouse);
  }, [captureMouse]);

  useFrame((_state) => controls.current!.update());

  return (
    <controls
      ref={controls}
      args={[camera, domElement]}
    />
  );
};

interface Props {
  setStageCtrl: (ctrl?: Controls) => void;
  captureMouse: boolean;
}

export default CameraControls;
