import { useCallback, useEffect, useRef } from "react";
import { ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events";
import { Subject } from "rxjs";
import * as THREE from 'three';
import { matrixToPosition, scaleUpByTouched, vectPrecision } from "model/3d/three.model";
import * as Geom from "model/geom";
import { StageSelection, StagePointerEvent, StageKeyEvent } from "model/stage/stage.model";
import { geom } from "model/geom.service";

const Selection: React.FC<Props> = ({ selection, ptrWire, keyWire }) => {
  const rectMesh = useRef<THREE.Mesh>(null);
  const rectGeom = useRef(geom.createSquareGeometry()).current;
  const polysGroup = useRef<THREE.Group>(null);
  const polysMesh = useRef<THREE.Mesh>(null);

  const dragging = useRef(false);
  const dragStart = useRef(new THREE.Vector3).current;
  const dragFinish = useRef(new THREE.Vector3).current;

  useEffect(() => {// Initialize and rehydrate
    polysGroup.current!.matrix.copy(selection.group.matrix);
    selection.group = polysGroup.current!;
    rectMesh.current?.scale.set(0, 0, 1);
  }, []);

  const restoreFromState = useCallback(({ localPolys }: StageSelection) => {
    rectMesh.current!.scale.set(0, 0, 0);
    polysMesh.current!.geometry = geom.polysToGeometry(localPolys);
  }, []);

  let fadeId = 0; // setTimeout avoids flicker on click
  const setPolysFaded = useCallback((shouldFade: boolean) => {
    clearTimeout(fadeId);
    const material = polysMesh.current!.material as THREE.Material;
    if (shouldFade) fadeId = window.setTimeout(() => (material.opacity = 0.08), 150);
    else material.opacity = 0.2;
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
        scale.set(0, 0, 0);
        if (!selection.additive && !lastKeyMsg.metaKey && !lastKeyMsg.shiftKey) {
          setPolysFaded(true); // Fade to indicate impending deletion
        }
      } else if (ptrDown && key === 'pointerup') {
        ptrDown = false;
        scale.set(0, 0, 0);
        setPolysFaded(false);
        if (Geom.Rect.fromPoints(position, point).area < 0.01 * 0.01) return;

        const ptr = point.clone();
        scaleUpByTouched(position, ptr);
        const rect = Geom.Rect.fromPoints(position, ptr);
        const polygons = [] as Geom.Polygon[];
        
        if (lastKeyMsg.shiftKey) {
          polygons.push(...geom.cutOut([Geom.Polygon.fromRect(rect)], selection.localPolys));
        } else if(lastKeyMsg.metaKey || selection.additive) {
          polygons.push(...geom.union(selection.localPolys.concat(Geom.Polygon.fromRect(rect))));
        } else {
          polygons.push(Geom.Polygon.fromRect(rect));
        }

        polygons.forEach(x => x.precision(1)); // Increments of 0.1
        selection.prevPolys = selection.localPolys.slice();
        selection.localPolys = polygons;
        restoreFromState(selection);
      } else if (key === 'pointerleave') {
        ptrDown = false;
        setPolysFaded(false);
      }
    });

    const [blue, red] = [geom.getColor('#00f'), geom.getColor('#f00')];

    const keySub = keyWire.subscribe((msg) => {
      lastKeyMsg = msg;
      (rectMesh.current!.material as THREE.MeshBasicMaterial).color = msg.shiftKey ? red : blue;

      ptrDown && setPolysFaded(!(msg.metaKey || msg.shiftKey || selection.additive));
      if (msg.key === 'Escape' && msg.type === 'keyup') {
        if (ptrDown) {// Cancel selection
          scale.set(0, 0, 1);
          setPolysFaded(ptrDown = false);
        } else {// Clear selection
          selection.localPolys = [];
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
    const matrix = polysGroup.current!.matrix;

    const ptrSub = ptrWire.subscribe(({ key, point }) => {
      if (!dragging.current) {
        return;
      } else if (key === 'pointermove') {
        matrix.setPosition(dragFinish.x + (point.x - dragStart.x), dragFinish.y + (point.y - dragStart.y), 0);
      } else if (key === 'pointerup' || key === 'pointerleave') {
        dragging.current = false;
        vectPrecision(dragFinish.set(matrix.elements[12], matrix.elements[13], 0), 1);
        matrix.setPosition(dragFinish.x, dragFinish.y, 0);
      }
    });

    return () => { ptrSub.unsubscribe(); };
  }, [selection]);

  useEffect(() => {
    if (!selection.locked) {// Apply transform on unlock
      const matrix = selection.group.matrix;
      for (const poly of selection.localPolys) {
        geom.applyMatrixPoly(matrix, poly).precision(1);
        if (poly.sign() < 0) poly.reverse();
      }
      matrix.identity();
      restoreFromState(selection);
    }
  }, [selection.locked]);

  useEffect(() => {// Listen for external updates to polygons
    restoreFromState(selection);
  }, [selection.localPolys]);

  return (
    <group name="SelectionRoot">
      <mesh
        ref={rectMesh}
        geometry={rectGeom}
        renderOrder={0} // Avoid occlusion by transparent walls
        visible={selection.enabled}
      >
        <meshBasicMaterial color="#00f" transparent opacity={0.2} />
      </mesh>

      <group
        name="SelectionTransform"
        ref={polysGroup}
        visible={selection.enabled}
        matrixAutoUpdate={false}
      >
        <mesh
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

    </group>
  );
};

interface Props {
  keyWire: Subject<StageKeyEvent>;
  ptrWire: Subject<StagePointerEvent>;
  selection: StageSelection;
}

export default Selection;
