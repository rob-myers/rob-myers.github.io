import { useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import { Vector3 } from "three";

import { VectorJson } from "model/geom";
import { ndCoordsToGroundPlane, vectAccuracy } from "model/3d/three.model";
import { StoredStage } from "store/stage.store";

const SelectionRect: React.FC<Props> = ({ wire, stage }) => {
  const camera = stage.controls!.camera;
  /** Ground position of pointer */
  const current = useRef(new Vector3).current;
  /** Ground position of last pointer down  */
  const initial = useRef(new Vector3).current;
  /** Should we show selection rectangle?  */
  const active = useRef(false);
  const mesh = useRef<THREE.Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sub = wire.subscribe(({ key, ndCoords }) => {
      if (key === 'pointerleave' || key === 'pointerup') {
        active.current = false;
      } else if (key === 'pointerdown') {
        active.current = true;
        ndCoordsToGroundPlane(initial, ndCoords, camera);
        vectAccuracy(initial, 1);
      } else if (key === 'pointermove' && active.current) {
        ndCoordsToGroundPlane(current, ndCoords, camera);
        vectAccuracy(current, 1);
        mesh.current?.position.set(
          (initial.x + current.x) * 0.5,
          (initial.y + current.y) * 0.5,
          0,
        );
        mesh.current?.scale.set(
          Math.abs(initial.x - current.x),
          Math.abs(initial.y - current.y),
          1,
        );
        !visible && setVisible(true);
      }
    });
    return () => sub.unsubscribe();
  }, []);

  return (
    <mesh ref={mesh} visible={visible} >
      <planeBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#aaa" opacity={1} />
    </mesh>
  );
};

interface Props {
  stage: StoredStage;
  wire: Wire;
}

export type Wire = Subject<{
  /** Normalized device coords in [-1, 1] * [-1, 1] */
  ndCoords: VectorJson;
} & (
  | { key: 'pointerdown' }
  | { key: 'pointerup' }
  | { key: 'pointerleave' }
  | { key: 'pointermove' }
)>;

export default SelectionRect;
