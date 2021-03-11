import { useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import { Vector3 } from "three";

import { VectorJson } from "model/geom";
import { ndCoordsToGroundPlane, vectAccuracy } from "model/3d/three.model";
import { StoredStage } from "store/stage.store";

const SelectionRect: React.FC<Props> = ({ wire, stage }) => {
  const root = useRef<THREE.Group>(null);
  const camera = stage.controls!.camera;
  /** Ground position of pointer */
  const current = useRef(new Vector3).current;
  /** Ground position of last pointer down  */
  const initial = useRef(new Vector3).current;
  /** Should we update the selection rectangle?  */
  const active = useRef(false);
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
        root.current?.position.set(
          (initial.x + current.x) * 0.5,
          (initial.y + current.y) * 0.5,
          0,
        );
        root.current?.scale.set(
          Math.abs(initial.x - current.x),
          Math.abs(initial.y - current.y),
          1,
        );
        !visible && setVisible(true);
      }
    });
    return () => sub.unsubscribe();
  }, [visible]);

  return (
    <group ref={root} visible={visible}>
      <mesh>
        <planeBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#59a" transparent opacity={0.4} />
      </mesh>
      <mesh scale={[0.5, 0.5, 0.5]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#f00" transparent opacity={0.2} />
        <circleBufferGeometry args={[1, 6]} />
      </mesh>
    </group>
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
