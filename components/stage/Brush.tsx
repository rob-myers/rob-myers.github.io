import { useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import { Vector3 } from "three";

import * as Geom from "model/geom";
import { ndCoordsToGroundPlane, vectPrecision } from "model/3d/three.model";
import { brushRectName, StageMeta } from "model/stage/stage.model";

const Brush: React.FC<Props> = ({ wire, stage }) => {
  const root = useRef<THREE.Group>(null);
  const controls = stage.internal.controls;
  /** Ground position of pointer */
  const current = useRef(new Vector3).current;
  /** Ground position of last pointer down  */
  const initial = useRef(new Vector3).current;
  /** Should we update the brush?  */
  const active = useRef(false);
  const [everUsed, setEverUsed] = useState(false);

  useEffect(() => {
    if (!controls) return;
    const group = root.current!;

    const sub = wire.subscribe(({ key, ndCoords }) => {
      if (key === 'pointerleave' || key === 'pointerup') {
        active.current = false;

        if (Math.abs(group.scale.x) >= 0.01 || Math.abs(group.scale.y) >= 0.01) {
          // Scale up rectangle to contain all touched 0.5 * 0.5 cells
          group.position.x = (group.scale.x > 0 ? Math.floor : Math.ceil)(10 * group.position.x) / 10;
          group.position.y = (group.scale.y > 0 ? Math.ceil : Math.floor)(10 * group.position.y) / 10;
          vectPrecision(group.position, 1);
          group.scale.set(current.x - group.position.x, -(current.y - group.position.y), 1);
          group.scale.x = (group.scale.x > 0 ? Math.ceil : Math.floor)(10 * group.scale.x) / 10;
          group.scale.y = (group.scale.y > 0 ? Math.ceil : Math.floor)(10 * group.scale.y) / 10;
          vectPrecision(group.scale, 1);
          // Sync with state
          stage.brush.position.copy(group.position);
          stage.brush.scale.copy(group.scale);
        } else {
          vectPrecision(group.position, 1);
          group.scale.set(0, 0, 0);
          stage.brush.position.copy(group.position);
          stage.brush.scale.set(0, 0);
        }
      } else if (key === 'pointerdown') {
        active.current = true;
        ndCoordsToGroundPlane(initial, ndCoords, controls.camera);
        current.copy(initial);
        group.position.set(initial.x, initial.y, 0);
        group.scale.set(0, 0, 0);
      } else if (key === 'pointermove' && active.current) {
        ndCoordsToGroundPlane(current, ndCoords, controls.camera);
        group.scale.set(current.x - initial.x, -(current.y - initial.y), 1);
        !everUsed && setEverUsed(true);
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [everUsed, controls]);

  return (
    <group ref={root} visible={everUsed}>
      <mesh name={brushRectName} position={[0.5, -0.5, 0]}>
        <planeBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#00f"
          transparent
          opacity={0.5}
        />
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
