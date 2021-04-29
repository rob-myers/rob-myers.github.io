import { useCallback, useEffect, useRef } from "react";
import { ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events";
import { Subject } from "rxjs";
import * as THREE from 'three';
import { matrixToPosition, scaleUpByTouched, vectPrecision } from "model/3d/three.model";
import * as Geom from "model/geom";
import { StageSelection, StagePointerEvent } from "model/stage/stage.model";
import { geom } from "model/geom.service";

const Selection: React.FC<Props> = ({ ptrWire, sel }) => {
  const group = useRef<THREE.Group>(null);
  const rectMesh = useRef<THREE.Mesh>(null);
  const rectGeom = useRef(geom.createSquareGeometry()).current;
  const wallMesh = useRef<THREE.Mesh>(null);
  const obsMesh = useRef<THREE.Mesh>(null);

  const ptrDown = useRef(false);
  const dragging = useRef(false);
  const dragStart = useRef(new THREE.Vector3).current;
  const dragFinish = useRef(new THREE.Vector3).current;

  const restoreFromState = useCallback(({ localBounds, localWall, localObs }: StageSelection) => {
    const { x, y , width, height } = localBounds;
    rectMesh.current!.position.set(x, y, 0);
    rectMesh.current!.scale.set(width, height, 1);
    ptrDown.current = false;
    wallMesh.current!.geometry = geom.polysToGeometry(localWall);
    obsMesh.current!.geometry = geom.polysToGeometry(localObs);
  }, []);

  const onDragPolys = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (sel.locked && e.type === 'pointerdown') {
      dragging.current = true;
      dragStart.copy(e.point);
      matrixToPosition(sel.group.matrix, dragFinish);
    }
  }, [sel.locked]);

  useEffect(() => {// Initialize and rehydrate
    group.current!.matrix.copy(sel.group.matrix);
    sel.group = group.current!;
    const { x, y , width, height } = sel.localBounds;
    rectMesh.current!.position.set(x, y, 0);
    rectMesh.current!.scale.set(width, height, 1);
  }, []);

  useEffect(() => {// Handle mouse when unlocked
    if (sel.locked) return;

    const [position, scale] = [rectMesh.current!.position, rectMesh.current!.scale];
    ptrDown.current = false;
    const ptrSub = ptrWire.subscribe(({ key, point }) => {
      if (ptrDown.current && key === 'pointermove') {
        scale.set(point.x - position.x, point.y - position.y, 1);
      } else if (key === 'pointerdown') {
        ptrDown.current = true;
        position.copy(point);
        scale.set(0, 0, 1);
      } else if (ptrDown.current && key === 'pointerup') {
        ptrDown.current = false;
        // if (Math.abs(position.x - point.x) < 0.01 && Math.abs(position.y - point.y) < 0.01) {
        //   return scale.set(0, 0, 1);
        // }
        const ptr = point.clone();
        scaleUpByTouched(position, ptr);
        sel.localBounds = Geom.Rect.fromPoints(position, ptr).precision(1);
        restoreFromState(sel);
      } else if (key === 'pointerleave') {
        ptrDown.current = false;
      }
    });
    return () => ptrSub.unsubscribe();
  }, [sel]);

  useEffect(() => {// Handle mouse when locked
    if (!sel.locked) return;

    const { matrix } = group.current!;
    const ptrSub = ptrWire.subscribe(({ key, point }) => {
      if (!dragging.current) {
        return;
      } else if (key === 'pointermove') {
        matrix.setPosition(dragFinish.x + (point.x - dragStart.x), dragFinish.y + (point.y - dragStart.y), 0);
      } else if (key === 'pointerup' || key === 'pointerleave') {
        dragging.current = false;
        vectPrecision(matrixToPosition(matrix, dragFinish), 1);
        matrix.setPosition(dragFinish.x, dragFinish.y, 0);
      }
    });
    return () => ptrSub.unsubscribe();
  }, [sel]);

  useEffect(() => {
    if (!sel.locked) {// Apply transform on unlock
      const { group: { matrix }, localBounds, localWall } = sel;
      geom.applyMatrixRect(matrix, localBounds);
      for (const poly of localWall) {
        geom.applyMatrixPoly(matrix, poly).precision(1);
        if (poly.sign() < 0) poly.reverse();
      }
      matrix.identity();
      restoreFromState(sel);
    }
  }, [sel.locked]);

  useEffect(() => {// Listen for external updates
    restoreFromState(sel);
  }, [sel.localBounds, sel.localWall, sel.localObs]);

  return (
    <group
      name="SelectionRoot"
      ref={group}
      visible={sel.enabled}
      matrixAutoUpdate={false}
    >
      <mesh
        ref={rectMesh}
        geometry={rectGeom}
        renderOrder={0} // Avoid occlusion by transparent walls
        onPointerDown={onDragPolys}
      >
        <meshBasicMaterial
          color={sel.locked ? "#060" : "#00f"}
          transparent
          opacity={0.2}
        />
      </mesh>

      <mesh
        ref={wallMesh}
        onPointerDown={onDragPolys}
        visible={sel.locked}
      >
        <meshBasicMaterial
          color="#00f"
          transparent
          opacity={0.4}
        />
      </mesh>

      <mesh
        ref={obsMesh}
        visible={sel.locked}
      >
        <meshBasicMaterial
          color="#f00"
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
};

interface Props {
  ptrWire: Subject<StagePointerEvent>;
  sel: StageSelection;
}

export default Selection;
