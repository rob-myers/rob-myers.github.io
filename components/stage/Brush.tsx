import { useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import { Vector3 } from "three";

import { VectorJson } from "model/geom";
import { ndCoordsToGroundPlane, vectAccuracy } from "model/3d/three.model";
import { StoredStage } from "model/stage.model";

const Brush: React.FC<Props> = ({ wire, stage }) => {
  const root = useRef<THREE.Group>(null);
  const camera = stage.controls!.camera;
  /** Ground position of pointer */
  const current = useRef(new Vector3).current;
  /** Ground position of last pointer down  */
  const initial = useRef(new Vector3).current;
  /** Should we update the selection rectangle?  */
  const active = useRef(false);
  const [everUsed, setEverUsed] = useState(false);
  
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
        !everUsed && setEverUsed(true);
      }
    });
    return () => sub.unsubscribe();
  }, [everUsed]);

  const meta = stage.brush;
  let rectOpacity = 0.2, polyOpacity = 0.1, polyColor = '#000';
  let rectColor = meta.mode === 'add' ? '#00f' : '#f00';
  if (meta.shape === 'poly') {
    [rectColor, polyColor] = [polyColor, rectColor];
    [rectOpacity, polyOpacity] = [polyOpacity, rectOpacity];
  }

  return (
    <group ref={root} visible={everUsed}>
      <mesh>
        <planeBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={rectColor} transparent opacity={rectOpacity} />
      </mesh>
      <mesh scale={[0.5, 0.5, 0.5]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color={polyColor} transparent opacity={polyOpacity} />
        <circleBufferGeometry args={[1, meta.sides]} />
      </mesh>
    </group>
  );
};

interface Props {
  stage: StoredStage;
  wire: Subject<PointerMsg>;
}

export type PointerMsg = {
  /** Normalized device coords in [-1, 1] * [-1, 1] */
  ndCoords: VectorJson;
} & (
  | { key: 'pointerdown' }
  | { key: 'pointerup' }
  | { key: 'pointerleave' }
  | { key: 'pointermove' }
);

export default Brush;
