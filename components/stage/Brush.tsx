import { useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import { Vector3 } from "three";

import * as Geom from "model/geom";
import { ndCoordsToGroundPlane, vectAccuracy } from "model/3d/three.model";
import { brushRectName, StageMeta } from "model/stage/stage.model";

const Brush: React.FC<Props> = ({ wire, stage }) => {
  const root = useRef<THREE.Group>(null);
  const camera = stage.internal.controls!.camera;
  /** Ground position of pointer */
  const current = useRef(new Vector3).current;
  /** Ground position of last pointer down  */
  const initial = useRef(new Vector3).current;
  /** Should we update the brush?  */
  const active = useRef(false);
  const [everUsed, setEverUsed] = useState(false);

  useEffect(() => {
    const group = root.current!;

    const sub = wire.subscribe(({ key, ndCoords }) => {
      if (key === 'pointerleave' || key === 'pointerup') {
        active.current = false;
        // Sync with state
        stage.brush.position.copy(group.position);
        vectAccuracy(group.scale, 1);
        stage.brush.scale.copy(group.scale);
      } else if (key === 'pointerdown') {
        ndCoordsToGroundPlane(initial, ndCoords, camera);
        active.current = true;
        vectAccuracy(initial, 1);
        group.position.set(initial.x, initial.y, 0);
        group.scale.set(0, 0, 0);
      } else if (key === 'pointermove' && active.current) {
        ndCoordsToGroundPlane(current, ndCoords, camera);
        group.scale.set(current.x - initial.x, -(current.y - initial.y), 1);
        !everUsed && setEverUsed(true);
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [everUsed]);

  return (
    <group ref={root} visible={everUsed}>
      <mesh name={brushRectName} position={[0.5, -0.5, 0]}>
        <planeBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00f" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

interface Props {
  stage: StageMeta;
  wire: Subject<PointerMsg>;
}

export type PointerMsg = {
  /** Normalized device coords in [-1, 1] * [-1, 1] */
  ndCoords: Geom.VectorJson;
} & (
  | { key: 'pointerdown' }
  | { key: 'pointerup' }
  | { key: 'pointerleave' }
  | { key: 'pointermove' }
);

export default Brush;
