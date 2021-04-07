import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Subject } from "rxjs";
import * as THREE from "three";
import { PointerEvent, useThree } from "react-three-fiber";

import * as Geom from "model/geom";
import { ndCoordsToGround, vectPrecision } from "model/3d/three.model";
import { BrushMeta, getScaledBrushRect } from "model/stage/stage.model";
import { geomService } from "model/geom.service";
import useGeomStore from "store/geom.store";

const Brush: React.FC<Props> = ({ wire, brush }) => {
  // console.log('Brush')
  const originTexture = useGeomStore(({ texture }) => texture.thinPlusPng);
  const { camera } = useThree();
  const selectorRef = useRef<THREE.Mesh>(null);
  const selectorScaledRef = useRef<THREE.Mesh>(null);
  const selectionRef = useRef<THREE.Mesh>(null);

  /**
   * The ground position of last pointer down.
   * If brush.locked, we compute it relative to
   * to the brush position at that time.
   */
  const initial = useRef(new THREE.Vector3).current;
  /** Should we update the brush? */
  const active = useRef(false);
  // Has the brush ever been used?
  const [everUsed, setEverUsed] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // NOTE brush.{position,scale,selectFrom} refs never change
  const { position: brushPosition, scale: brushScale, selectFrom, locked } = brush;

  useEffect(() => {
    const position = selectorRef.current!.position;
    const scale = selectorScaledRef.current!.scale;
    const selection = selectionRef.current!;

    if (!locked) {// Reset selection offset
      selection.position.set(0, 0, 0);
    }
    setShowCursor(!locked);

    /** Store the selector's position/scale in stage.brush */
    function syncBrush() { brushPosition.copy(position) && brushScale.copy(scale); }
    /** Set selector's scale via mouse position relative to `from`. */
    function computeRelScale(ndCoords: Geom.VectorJson, from: THREE.Vector3) {
      ndCoordsToGround(scale, ndCoords, camera).sub(from).set(scale.x, -scale.y, 1);
    }

    const sub = wire.subscribe(({ key, ndCoords }) => {
      if (!locked) {
        if (key === 'pointermove' && active.current) {
          computeRelScale(ndCoords, initial);
          !everUsed && setEverUsed(true);
        } else if ((key === 'pointerleave' || key === 'pointerup') && active.current) {
          active.current = false;
          if (Math.abs(scale.x) >= 0.01 || Math.abs(scale.y) >= 0.01) {
            // We scale up rectangle to contain all touched 0.1 * 0.1 cells
            position.x = (scale.x > 0 ? Math.floor : Math.ceil)(10 * position.x) / 10;
            position.y = (scale.y > 0 ? Math.ceil : Math.floor)(10 * position.y) / 10;
            vectPrecision(position, 1);
            computeRelScale(ndCoords, position);
            scale.x = (scale.x > 0 ? Math.ceil : Math.floor)(10 * scale.x) / 10;
            scale.y = (scale.y > 0 ? Math.ceil : Math.floor)(10 * scale.y) / 10;
            vectPrecision(scale, 1);
          } else {
            vectPrecision(position, 1);
            scale.set(0, 0, 0);
          }
          syncBrush();
          setShowCursor(true);
        } else if (key === 'pointerdown') {
          active.current = true;
          position.copy(ndCoordsToGround(initial, ndCoords, camera));
          scale.set(0, 0, 0);
          setShowCursor(false);
        }
      } else if (active.current) {
        if (key === 'pointermove') {
          ndCoordsToGround(position, ndCoords, camera).sub(initial);
          selection.position.copy(position).sub(selectFrom);
        } else if (key === 'pointerup' || key === 'pointerleave') {
          active.current = false;
          vectPrecision(position, 1);
          selection.position.copy(position).sub(selectFrom);
          syncBrush();
        }
      }
    });
    return () => sub.unsubscribe();
  }, [everUsed, locked]);

  const onMeshPointerDown = useCallback((e: PointerEvent) => {
    if (locked && e.type === 'pointerdown') {
      active.current = true; // Store place clicked, relative to brush position
      initial.set(e.point.x - brushPosition.x, e.point.y - brushPosition.y, 0);
      setShowCursor(false);
    }
  }, [locked]);

  const { selectionGeom, selectorBorderGeom } = useMemo(() => {
    const polygons = brush.selectedPolys.flatMap(x => x.polygons);
    const rectPoly = getScaledBrushRect(brush);
    const border = rectPoly.rect.area && geomService.cutOut([rectPoly], rectPoly.createOutset(0.01));
    return {
      selectionGeom: geomService.polysToGeometry(polygons, 'xy', 0.001),
      selectorBorderGeom: geomService.polysToGeometry(border || [], 'xy', 0.001),
    };
  }, [brush]);

  return (
    <>
      <group ref={selectorRef}>
        {originTexture && <mesh visible={showCursor}>
          <planeGeometry args={[0.08, 0.08]} />
          <meshBasicMaterial map={originTexture} transparent />
        </mesh>}
        <mesh geometry={selectorBorderGeom} visible={locked}>
          <meshBasicMaterial color="#fff" />
        </mesh>
        <mesh
          ref={selectorScaledRef}
          visible={everUsed}
          geometry={selectorRectGeom}
          onPointerDown={onMeshPointerDown}
          renderOrder={0} // Avoids occlusion when behind transparent walls
        >
          <meshBasicMaterial
            color="#00f"
            transparent
            opacity={locked ? 0.1 : 0.2}
          />
        </mesh>
      </group>
      <mesh ref={selectionRef} geometry={selectionGeom}>
        <meshBasicMaterial
          color="#00f"
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
};

/** Top left is (0, 0) */
const selectorRectGeom = geomService.polysToGeometry([
  Geom.Polygon.fromRect(new Geom.Rect(0, -1, 1, 1))
], 'xy', 0.001);

interface Props {
  brush: BrushMeta;
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
