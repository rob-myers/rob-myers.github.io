import { useCallback, useEffect, useRef } from "react";
import { ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events";
import { Subject } from "rxjs";
import * as THREE from 'three';
import { matrixToPosition, scaleUpByTouched, vectPrecision } from "model/3d/three.model";
import * as Geom from "model/geom";
import { StageSelection, StagePointerEvent, StageKeyEvent } from "model/stage/stage.model";
import { geom } from "model/geom.service";

const Selection: React.FC<Props> = ({ selection, ptrWire, keyWire }) => {
  const group = useRef<THREE.Group>(null);
  const polysMesh = useRef<THREE.Mesh>(null);
  const rectMesh = useRef<THREE.Mesh>(null);
  const rectGeom = useRef(geom.createSquareGeometry()).current;

  const dragging = useRef(false);
  const dragStart = useRef(new THREE.Vector3).current;
  const dragFinish = useRef(new THREE.Vector3).current;

  useEffect(() => {// Initialize and rehydrate
    group.current!.matrix.copy(selection.group.matrix);
    selection.group = group.current!;
    const { x, y , width, height } = selection.localBounds;
    rectMesh.current!.position.set(x, y, 0);
    rectMesh.current!.scale.set(width, height, 1);
  }, []);

  const restoreFromState = useCallback(({ localBounds, localWall: wall }: StageSelection) => {
    const { x, y , width, height } = localBounds;
    rectMesh.current!.position.set(x, y, 0);
    rectMesh.current!.scale.set(width, height, 1);
    // TODO create transparent walls instead
    polysMesh.current!.geometry = geom.polysToGeometry(wall);
  }, []);
 
  const onDragPolys = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (selection.locked && e.type === 'pointerdown') {
      dragging.current = true;
      dragStart.copy(e.point);
      matrixToPosition(selection.group.matrix, dragFinish);
    }
  }, [selection.locked]);

  useEffect(() => {// Handle mouse/keys when unlocked
    if (selection.locked) return;

    const [position, scale] = [rectMesh.current!.position, rectMesh.current!.scale];
    let [ptrDown, lastKeyMsg] = [false, {} as StageKeyEvent];

    const ptrSub = ptrWire.subscribe(({ key, point }) => {

      if (ptrDown && key === 'pointermove') {
        scale.set(point.x - position.x, point.y - position.y, 1);
      } else if (key === 'pointerdown') {
        ptrDown = true;
        position.copy(point);
        scale.set(0, 0, 1);
      } else if (ptrDown && key === 'pointerup') {
        ptrDown = false;
        if (Geom.Rect.fromPoints(position, point).area < 0.01 * 0.01) {
          return scale.set(0, 0, 1);
        }
        const ptr = point.clone();
        scaleUpByTouched(position, ptr);
        selection.localBounds = Geom.Rect.fromPoints(position, ptr).precision(1);
        restoreFromState(selection);
      } else if (key === 'pointerleave') {
        ptrDown = false;
      }
    });

    const [blue, red] = [geom.getColor('#00f'), geom.getColor('#f00')];

    const keySub = keyWire.subscribe((msg) => {
      lastKeyMsg = msg;
      (rectMesh.current!.material as THREE.MeshBasicMaterial).color = msg.shiftKey ? red : blue;

      if (msg.key === 'Escape' && msg.type === 'keyup') {
        if (ptrDown) {// Cancel selection
          scale.set(0, 0, 1);
        } else {// Clear selection
          selection.localBounds = new Geom.Rect(0, 0, 0, 0);
          restoreFromState(selection);
        }
      }
    });

    return () => {
      ptrSub.unsubscribe();
      keySub.unsubscribe();
    };
  }, [selection]);

  useEffect(() => {// Handle mouse when locked
    if (!selection.locked) return;
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

    return () => { ptrSub.unsubscribe(); };
  }, [selection]);

  useEffect(() => {
    if (!selection.locked) {// Apply transform on unlock
      const { group: { matrix }, localBounds, localWall } = selection;
      geom.applyMatrixRect(matrix, localBounds);
      for (const poly of localWall) {
        geom.applyMatrixPoly(matrix, poly).precision(1);
        if (poly.sign() < 0) poly.reverse();
      }
      matrix.identity();
      restoreFromState(selection);
    }
  }, [selection.locked]);

  useEffect(() => {// Listen for external updates
    restoreFromState(selection);
  }, [selection.localWall, selection.localObs]);

  return (
    <group
      name="SelectionRoot"
      ref={group}
      visible={selection.enabled}
      matrixAutoUpdate={false}
    >
      <mesh
        ref={rectMesh}
        geometry={rectGeom}
        renderOrder={0} // Avoid occlusion by transparent walls
        onPointerDown={onDragPolys}
      >
        <meshBasicMaterial
          color="#00f"
          transparent
          opacity={0.2}
        />
      </mesh>

      <mesh
        // TODO show walls here!
        ref={polysMesh}
        onPointerDown={onDragPolys}
      >
        <meshBasicMaterial
          color="#00f"
          transparent
          opacity={selection.locked ? 0.4 : 0.2}
        />
      </mesh>
    </group>
  );
};

interface Props {
  keyWire: Subject<StageKeyEvent>;
  ptrWire: Subject<StagePointerEvent>;
  selection: StageSelection;
}

export default Selection;
