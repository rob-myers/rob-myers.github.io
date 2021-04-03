import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Subject } from "rxjs";
import * as THREE from "three";
import { PointerEvent } from "react-three-fiber";

import * as Geom from "model/geom";
import { ndCoordsToGroundPlane, vectPrecision } from "model/3d/three.model";
import { getScaledBrushRect, StageMeta } from "model/stage/stage.model";
import { geomService } from "model/geom.service";

const Brush: React.FC<Props> = ({ wire, stage }) => {
  const selectorRef = useRef<THREE.Mesh>(null);
  const selectorScaledRef = useRef<THREE.Mesh>(null);
  const selectionRef = useRef<THREE.Mesh>(null);

  /** Ground position of pointer */
  const current = useRef(new THREE.Vector3).current;
  /** Ground position of pointer on last pointer down  */
  const initial = useRef(new THREE.Vector3).current;
  /** Should we update the brush?  */
  const active = useRef(false);
  // Has the brush ever been used?
  const [everUsed, setEverUsed] = useState(false);
    
  const locked = stage.brush.locked;

  useEffect(() => {
    const position = selectorRef.current!.position;
    const scale = selectorScaledRef.current!.scale;
    const selection = selectionRef.current!;
    const controls = stage.internal.controls!;

    if (!locked) {// Reset selection offset
      selection.position.set(0, 0, 0);
    }

    const sub = wire.subscribe(({ key, ndCoords }) => {
      if (!locked) {
        if (key === 'pointermove' && active.current) {
          ndCoordsToGroundPlane(current, ndCoords, controls.camera);
          scale.set(current.x - initial.x, -(current.y - initial.y), 1);
          !everUsed && setEverUsed(true);
        } else if (key === 'pointerleave' || key === 'pointerup') {
          active.current = false;
          if (Math.abs(scale.x) >= 0.01 || Math.abs(scale.y) >= 0.01) {
            // Scale up rectangle to contain all touched 0.1 * 0.1 cells
            position.x = (scale.x > 0 ? Math.floor : Math.ceil)(10 * position.x) / 10;
            position.y = (scale.y > 0 ? Math.ceil : Math.floor)(10 * position.y) / 10;
            vectPrecision(position, 1);
            scale.set(current.x - position.x, -(current.y - position.y), 1);
            scale.x = (scale.x > 0 ? Math.ceil : Math.floor)(10 * scale.x) / 10;
            scale.y = (scale.y > 0 ? Math.ceil : Math.floor)(10 * scale.y) / 10;
            vectPrecision(scale, 1);
            // Sync state
            stage.brush.position.copy(position);
            stage.brush.scale.copy(scale);
          } else {
            vectPrecision(position, 1);
            scale.set(0, 0, 0);
            stage.brush.position.copy(position);
            stage.brush.scale.set(0, 0);
          }
        } else if (key === 'pointerdown') {
          active.current = true;
          ndCoordsToGroundPlane(initial, ndCoords, controls.camera);
          current.copy(initial);
          position.set(initial.x, initial.y, 0);
          scale.set(0, 0, 0);
        }
      } else {
        if (key === 'pointermove' && active.current) {
          ndCoordsToGroundPlane(position, ndCoords, controls.camera);
          position.add(initial);
          selection.position.copy(position).sub(stage.brush.selectFrom);
        } else if (key === 'pointerup' || key === 'pointerleave') {
          active.current = false;
          vectPrecision(position, 1);
          selection.position.copy(position).sub(stage.brush.selectFrom);
          // Sync state
          stage.brush.position.copy(position);
          stage.brush.scale.copy(scale);
        }
      }
    });
    return () => sub.unsubscribe();
  }, [everUsed, locked]);

  const onMeshPointerDown = useCallback((e: PointerEvent) => {
    if (locked && e.type === 'pointerdown') {
      active.current = true; // Store selector offset:
      initial.set(stage.brush.position.x - e.point.x, stage.brush.position.y - e.point.y, 0);
    }
  }, [locked]);

  const selectionGeom = useMemo(() => {
    const polygons = stage.brush.selection.flatMap(x => x.polygons);
    return geomService.polysToGeometry(polygons);
  }, [stage.brush.selection]);

  const selectorBorderGeom = useMemo(() => {
    const rectPoly = getScaledBrushRect(stage.brush);
    return geomService.polysToGeometry(
      geomService.cutOut([rectPoly], rectPoly.createOutset(0.01)));
  }, [stage.brush.selection]);

  return (
    <>
      <group ref={selectorRef}>
        <mesh geometry={selectorBorderGeom} visible={locked}>
          <meshBasicMaterial color="#fff" transparent />
        </mesh>
        <mesh
          ref={selectorScaledRef}
          visible={everUsed}
          geometry={selectorRectGeom}
          onPointerDown={onMeshPointerDown}
        >
          <meshBasicMaterial color="#00f" transparent opacity={locked ? 0.1 : 0.2} />
        </mesh>
      </group>
      <mesh ref={selectionRef} geometry={selectionGeom}>
        <meshBasicMaterial color="#00f" transparent opacity={0.2} />
      </mesh>
    </>
  );
};

const selectorRectGeom = geomService.polysToGeometry([
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
