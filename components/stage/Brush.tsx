import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Subject } from "rxjs";
import { Vector3 } from "three";
import { PointerEvent } from "react-three-fiber";

import * as Geom from "model/geom";
import { ndCoordsToGroundPlane, vectPrecision } from "model/3d/three.model";
import { geomService } from "model/geom.service";
import { StageMeta } from "model/stage/stage.model";

const Brush: React.FC<Props> = ({ wire, stage }) => {
  const selectorRef = useRef<THREE.Mesh>(null);
  const selectionRef = useRef<THREE.Mesh>(null);

  /** Ground position of pointer */
  const current = useRef(new Vector3).current;
  /** Ground position of last pointer down  */
  const initial = useRef(new Vector3).current;
  /** Should we update the brush?  */
  const active = useRef(false);
  const [everUsed, setEverUsed] = useState(false);

  const locked = stage.brush.locked;

  useEffect(() => {
    const selector = selectorRef.current!;
    const selection = selectionRef.current!;
    const controls = stage.internal.controls!;

    const sub = wire.subscribe(({ key, ndCoords }) => {
      if (!locked) {
        if (key === 'pointermove' && active.current) {
          ndCoordsToGroundPlane(current, ndCoords, controls.camera);
          selector.scale.set(current.x - initial.x, -(current.y - initial.y), 1);
          !everUsed && setEverUsed(true);
        } else if (key === 'pointerleave' || key === 'pointerup') {
          active.current = false;
          if (Math.abs(selector.scale.x) >= 0.01 || Math.abs(selector.scale.y) >= 0.01) {
            // Scale up rectangle to contain all touched 0.1 * 0.1 cells
            selector.position.x = (selector.scale.x > 0 ? Math.floor : Math.ceil)(10 * selector.position.x) / 10;
            selector.position.y = (selector.scale.y > 0 ? Math.ceil : Math.floor)(10 * selector.position.y) / 10;
            vectPrecision(selector.position, 1);
            selector.scale.set(current.x - selector.position.x, -(current.y - selector.position.y), 1);
            selector.scale.x = (selector.scale.x > 0 ? Math.ceil : Math.floor)(10 * selector.scale.x) / 10;
            selector.scale.y = (selector.scale.y > 0 ? Math.ceil : Math.floor)(10 * selector.scale.y) / 10;
            vectPrecision(selector.scale, 1);
            // Sync state
            stage.brush.position.copy(selector.position);
            stage.brush.scale.copy(selector.scale);
          } else {
            vectPrecision(selector.position, 1);
            selector.scale.set(0, 0, 0);
            stage.brush.position.copy(selector.position);
            stage.brush.scale.set(0, 0);
          }
        } else if (key === 'pointerdown') {
          active.current = true;
          ndCoordsToGroundPlane(initial, ndCoords, controls.camera);
          current.copy(initial);
          selector.position.set(initial.x, initial.y, 0);
          selector.scale.set(0, 0, 0);
        }
      } else {
        if (key === 'pointermove' && active.current) {
          ndCoordsToGroundPlane(selector.position, ndCoords, controls.camera);
          selector.position.add(current);
          selection.position.copy(selector.position).sub(initial);
        } else if (key === 'pointerup' || key === 'pointerleave') {
          active.current = false;
          vectPrecision(selector.position, 1);
          selection.position.copy(selector.position).sub(initial);
          // Sync state
          stage.brush.position.copy(selector.position);
          stage.brush.scale.copy(selector.scale);
        }
      }
    });
    return () => sub.unsubscribe();
  }, [everUsed, locked]);

  const onMeshPointerDown = useCallback((e: PointerEvent) => {
    if (locked && e.type === 'pointerdown') {
      active.current = true;
      current.copy(selectorRef.current!.position).sub(e.point);
    }
  }, [locked]);

  const selectionGeom = useMemo(() => {
    const polygons = stage.brush.selection.flatMap(x => x.polygons);
    if (selectorRef.current) {// Store initial offset
      initial.copy(selectorRef.current.position);
      selectionRef.current?.position.set(0, 0, 0);
    }
    return geomService.polysToGeometry(polygons);
  }, [stage.brush.selection]);

  return (
    <>
      <mesh
        ref={selectorRef}
        visible={everUsed}
        onPointerDown={onMeshPointerDown}
        geometry={rectGeom}
      >
        <meshBasicMaterial
          color="#00f"
          transparent
          opacity={0.2}
        />
      </mesh>
      <mesh
        ref={selectionRef}
        geometry={selectionGeom}
      >
        <meshBasicMaterial
          color="#f00"
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
};

const rectGeom = geomService.polysToGeometry([
  Geom.Polygon.fromRect(new Geom.Rect(0, -1, 1, 1))
]);

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
