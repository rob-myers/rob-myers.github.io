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

  // Initialize and rehydrate
  useEffect(() => {
    selection.group = group.current!;
    cursorMesh.current?.position.set(selection.cursor.x, selection.cursor.y, 0);
    rectMesh.current?.scale.set(0, 0, 1);
    return () => void delete selection.group;
  }, []);

  const restoreFromState = useCallback(({ polygons }: StageSelection) => {
    rectMesh.current!.scale.set(0, 0, 0);
    setPolysGeom(geomService.polysToGeometry(polygons));
    setOutlineGeom(geomService.polysToGeometry(
      geomService.cutOut(polygons, polygons.flatMap(x => x.createOutset(0.01)))
    ));
  }, []);

  // Handle mouse/keys when unlocked
  useEffect(() => {
    if (selection.locked) return;

    const [position, scale] = [rectMesh.current!.position, rectMesh.current!.scale];
    const cursorPosition = cursorMesh.current!.position;
    let [ptr, ptrDown, lastKeyMsg] = [new THREE.Vector3, false, {} as StageKeyEvent];

    const ptrSub = ptrWire.subscribe(({ key, ndCoords }) => {
      if (ptrDown && key === 'pointermove') {
        ndCoordsToGround(ndCoords, camera, ptr);
        scale.set(ptr.x - position.x, ptr.y - position.y, 1);
      } else if (key === 'pointerdown') {
        ptrDown = true;
        position.copy(ndCoordsToGround(ndCoords, camera, ptr))
        scale.set(0, 0, 0);
        selection.cursor.copy(position);
      } else if (ptrDown && key === 'pointerup') {
        ptrDown = false;
        scale.set(0, 0, 0);
        if (Geom.Rect.fromPoints(position, ptr).area < 0.01 * 0.01) {
          vectPrecision(cursorPosition.copy(position), 1);
          return;
        }

        scaleUpByTouched(position, ptr);
        const rect = Geom.Rect.fromPoints(position, ptr);
        const polygons = [] as Geom.Polygon[];
        
        if (lastKeyMsg.shiftKey) {
          polygons.push(...geomService.cutOut([Geom.Polygon.fromRect(rect)], selection.polygons));
        } else if(lastKeyMsg.metaKey || selection.additive) {
          polygons.push(...geomService.union(selection.polygons.concat(Geom.Polygon.fromRect(rect))));
        } else {
          polygons.push(Geom.Polygon.fromRect(rect));
        }

        polygons.forEach(x => x.precision(1)); // Increments of 0.1
        // Must assign before setPolysGeom
        selection.prevPolys = selection.polygons.slice();
        selection.polygons = polygons;
        setPolysGeom(geomService.polysToGeometry(polygons));

      } else if (key === 'pointerleave') {
        ptrDown = false;
        selection.cursor.copy(position);
      }
    });

    const [blue, red] = [geomService.getColor('#00f'), geomService.getColor('#f00')];
    const keySub = keyWire.subscribe((msg) => {
      lastKeyMsg = msg;
      (rectMesh.current!.material as THREE.MeshBasicMaterial).color = msg.shiftKey ? red : blue;
      if (msg.key === 'Escape' && ptrDown) {
        position.copy(ptr);
        scale.set(0, 0, 1);
        ptrDown = false;
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
    const [position, ptr] = [polysGroup.current!.position, new THREE.Vector3];

    const ptrSub = ptrWire.subscribe(({ key, ndCoords }) => {
      if (!dragging.current) {
        return;
      } else if (key === 'pointermove') {
        ndCoordsToGround(ndCoords, camera, ptr);
        position.copy(ptr).sub(dragStart);
      } else if (key === 'pointerup' || key === 'pointerleave') {
        dragging.current = false;
        vectPrecision(position, 1);
        // Apply transform
        selection.polygons.map(x => x.add(position).precision(1));
        position.set(0, 0, 0);
        restoreFromState(selection);
      }
    });

    return () => { ptrSub.unsubscribe(); };
  }, [selection]);

  // Listen for external updates to polygons
  useEffect(() => {
    restoreFromState(selection);
  }, [selection.polygons]);

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
        visible={selection.enabled}
      >
        <meshBasicMaterial color="#00f" transparent opacity={0.2} />
      </mesh>

      <group
        ref={polysGroup}
        visible={selection.enabled}
      >
        <mesh
          geometry={polysGeom}
          onPointerDown={(e: PointerEvent) => {
            if (selection.locked && e.type === 'pointerdown') {
              dragging.current = true;
              dragStart.copy(e.point);
            }
          }}
        >
          <meshBasicMaterial color="#00f" transparent opacity={0.2} />
        </mesh>

        <mesh
          visible={selection.locked}
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
