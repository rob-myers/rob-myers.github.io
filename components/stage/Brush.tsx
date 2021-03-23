import { useEffect, useMemo, useRef, useState } from "react";
import { Subject } from "rxjs";
import THREE, { DoubleSide, Vector3 } from "three";

import { VectorJson } from "model/geom";
import { ndCoordsToGroundPlane, vectAccuracy } from "model/3d/three.model";
import { brushPolyName, brushRectName, computeBrushStyles, StoredStage } from "model/stage/stage.model";
import { geomService } from "model/geom.service";

const Brush: React.FC<Props> = ({ wire, stage }) => {
  const root = useRef<THREE.Group>(null);
  const camera = stage.controls!.camera;
  /** Ground position of pointer */
  const current = useRef(new Vector3).current;
  /** Ground position of last pointer down  */
  const initial = useRef(new Vector3).current;
  /** Should we update the brush?  */
  const active = useRef(false);
  const [everUsed, setEverUsed] = useState(false);
  
  useEffect(() => {
    // useStage.api.updateBrush(stage.key, { group: root.current! });

    const sub = wire.subscribe(({ key, ndCoords }) => {
      if (key === 'pointerleave' || key === 'pointerup') {
        if (active.current && root.current) {// Sync the state
          stage.brush.position.copy(root.current.position);
          stage.brush.scale.copy(root.current.scale);
        }
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
    return () => {
      // useStage.api.updateBrush(stage.key, { group: null });
      sub.unsubscribe();
    };
  }, [everUsed]);

  const brush = stage.brush;

  const { rectOpacity, rectColor, polyOpacity, polyColor } = useMemo(() =>
    computeBrushStyles(brush.shape)
  , [brush.shape]);

  const polyGeom = useMemo(() => {
    return geomService.polysToGeometry([brush.polygon]).toBufferGeometry();
  }, [brush.polygon]);

  return (
    <group ref={root} visible={everUsed}>
      <mesh name={brushRectName}>
        <planeBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={rectColor} transparent opacity={rectOpacity} />
      </mesh>
      <mesh name={brushPolyName} geometry={polyGeom}>
        <meshStandardMaterial side={DoubleSide} color={polyColor} transparent opacity={polyOpacity} />
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
