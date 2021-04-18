import { useCallback, useEffect, useRef, useState } from "react";
import { useThree, PointerEvent } from "react-three-fiber";
import { Subject } from "rxjs";
import * as THREE from 'three';
import { ndCoordsToGround, scaleUpByTouched, vectPrecision } from "model/3d/three.model";
import * as Geom from "model/geom";
import { StageSelection, StagePointerEvent, StageKeyEvent } from "model/stage/stage.model";
import { geomService } from "model/geom.service";
import useGeomStore from "store/geom.store";

const Selection: React.FC<Props> = ({ selection, ptrWire, keyWire }) => {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const cursorMesh = useRef<THREE.Mesh>(null);
  const cursorTexture = useGeomStore(({ texture }) => texture.thinPlusPng);
  const rectMesh = useRef<THREE.Mesh>(null);
  const rectGeom = useRef(geomService.createSquareGeometry()).current;
  const [polysGeom, setPolysGeom] = useState(geomService.polysToGeometry(selection.polygons));
  const [outlineGeom, setOutlineGeom] = useState(geomService.polysToGeometry([]));

  const polysGroup = useRef<THREE.Group>(null);
  const dragging = useRef(false);
  const dragStart = useRef(new THREE.Vector3).current;

  useEffect(() => {
    selection.group = group.current!;
    const { cursor, dragOffset } = selection;
    cursorMesh.current?.position.set(cursor.x, cursor.y, 0);
    rectMesh.current?.scale.set(0, 0, 1);
    polysGroup.current?.position.set(dragOffset.x, dragOffset.y, 0);
    return () => void delete selection.group;
  }, []);

  const restoreFromState = useCallback((selection: StageSelection) => {
    switch (selection.selector) {
      case 'rectangle':
        const { x, y, e, s } = selection.rect;
        rectMesh.current!.position.set(x, y, 0);
        rectMesh.current!.scale.set(e - x, s - y, 1);
        updateLockedOutline([Geom.Polygon.fromRect(selection.rect)]);
        break;
      case 'rectilinear':
        rectMesh.current!.scale.set(0, 0, 0);
        setPolysGeom(geomService.polysToGeometry(selection.polygons));
        updateLockedOutline(selection.polygons);
        break;
    }
  }, []);

  const updateLockedOutline = useCallback((polygons: Geom.Polygon[]) => {
    setOutlineGeom(geomService.polysToGeometry(
      geomService.cutOut(polygons, polygons.flatMap(x => x.createOutset(0.01)))
    ));
  }, []);

  
  useEffect(() => {// Handle selector change
    restoreFromState(selection);
  }, [selection.selector]);

  /**
   * Apply any transform when unlock
   * TODO affine transforms
   */
  useEffect(() => {
    if (!selection.locked && selection.dragOffset.length) {
      // selection.rect.add(selection.dragOffset);
      selection.polygons.map(x => x.add(selection.dragOffset));
      selection.dragOffset.copy(polysGroup.current!.position.set(0, 0, 0));
      restoreFromState(selection);
    }
  }, [selection.locked]);

  // Handle mouse/keys when unlocked
  useEffect(() => {
    if (selection.locked) return;

    const [position, scale] = [rectMesh.current!.position, rectMesh.current!.scale];
    const cursorPosition = cursorMesh.current!.position;
    let [ptr, ptrDown, shiftDown] = [new THREE.Vector3, false, false];

    const ptrSub = ptrWire.subscribe(({ key, ndCoords }) => {
      if (ptrDown && key === 'pointermove') {
        ndCoordsToGround(ndCoords, camera, ptr);
        scale.set(ptr.x - position.x, ptr.y - position.y, 1);
      } else if (key === 'pointerdown') {
        ptrDown = true;
        position.copy(ndCoordsToGround(ndCoords, camera, ptr))
        scale.set(0, 0, 0);
        selection.cursor.copy(position);
        
        if (selection.selector === 'crosshair' && !selection.locked) {
          vectPrecision(cursorPosition.copy(position), 1);
        }
      } else if (ptrDown && key === 'pointerup') {
        ptrDown = false;

        if (Geom.Rect.fromPoints(position, ptr).area < 0.01 * 0.01) {
          scale.set(0, 0, 0);
        } else if (selection.selector === 'rectilinear') {
          scale.set(0, 0, 0);
          scaleUpByTouched(position, ptr);
          const rect = Geom.Rect.fromPoints(position, ptr);
            // // TODO invert transformation instead
            // .translate({x : -selection.dragOffset.x, y: -selection.dragOffset.y });
          const polygons = shiftDown
            ? geomService.cutOut([Geom.Polygon.fromRect(rect)], selection.polygons)
            : geomService.union(selection.polygons.concat(Geom.Polygon.fromRect(rect)));
          polygons.forEach(x => x.precision(1)); // Increments of 0.1
          selection.polygons = polygons; // Must assign before setPolysGeom
          setPolysGeom(geomService.polysToGeometry(polygons));
        } else if (selection.selector === 'rectangle') {
          scaleUpByTouched(position, ptr);
          scale.set(ptr.x - position.x, ptr.y - position.y, 1);
          selection.rect = Geom.Rect.fromPoints(position, ptr);
          updateLockedOutline([Geom.Polygon.fromRect(selection.rect)]);
        }

      } else if (key === 'pointerleave') {
        ptrDown = false;
        selection.cursor.copy(position);
      }
    });

    const [blue, red] = [geomService.getColor('#00f'), geomService.getColor('#f00')];
    const keySub = keyWire.subscribe(({ shiftKey, key }) => {
      if (selection.selector === 'rectilinear') {
        shiftDown = shiftKey;
        (rectMesh.current!.material as THREE.MeshBasicMaterial).color = shiftDown ? red : blue;
        if (key === 'Escape' && ptrDown) {
          position.copy(ptr);
          scale.set(0, 0, 1);
          ptrDown = false;
        }
      }
    });

    return () => {
      ptrSub.unsubscribe();
      keySub.unsubscribe();
    };
  }, [selection]);

  // Handle mouse when locked
  useEffect(() => {
    if (!selection.locked) return;
    // TODO support dragging rect too? Seems complex...
    const [position, ptr] = [polysGroup.current!.position, new THREE.Vector3];
    const dragOffset = selection.dragOffset;

    const ptrSub = ptrWire.subscribe(({ key, ndCoords }) => {
      if (!dragging.current) {
        return;
      } else if (key === 'pointermove') {
        ndCoordsToGround(ndCoords, camera, ptr);
        position.set(dragOffset.x, dragOffset.y, 0).add(ptr).sub(dragStart);
      } else if (key === 'pointerup' || key === 'pointerleave') {
        dragging.current = false;
        vectPrecision(position, 1);
        selection.dragOffset.copy(position);
      }
    });

    return () => { ptrSub.unsubscribe(); };
  }, [selection]);

  // Listen for external updates to polygons
  useEffect(() => {
    setPolysGeom(geomService.polysToGeometry(selection.polygons));
    updateLockedOutline(selection.polygons);
  }, [selection.polygons]);

  const onLockedPointerDown = useCallback((e: PointerEvent) => {
    if (selection.locked && e.type === 'pointerdown') {
      dragging.current = true;
      dragStart.copy(e.point);
    }
  }, [selection]);

  return (
    <group ref={group} name="SelectionGroup">

      {cursorTexture && (
        <mesh ref={cursorMesh}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial map={cursorTexture} />
        </mesh>
      )}

      
        <mesh
          ref={rectMesh}
          geometry={rectGeom}
          renderOrder={0} // Avoid occlusion by transparent walls
          visible={selection.selector !== 'crosshair'}
          onPointerDown={onLockedPointerDown}
        >
          <meshBasicMaterial color="#00f" transparent opacity={0.2} />
        </mesh>

      <group ref={polysGroup}>
        <mesh
          geometry={polysGeom}
          visible={selection.selector === 'rectilinear'}
          onPointerDown={onLockedPointerDown}
        >
          <meshBasicMaterial color="#00f" transparent opacity={0.2} />
        </mesh>

        <mesh
          visible={selection.locked && selection.selector !== 'crosshair'}
          geometry={outlineGeom}
        >
          <meshBasicMaterial color="#000" transparent opacity={0.5} />
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
