import { useCallback, useEffect, useRef, useState } from "react";
import { ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events";
import { Subject } from "rxjs";
import * as THREE from 'three';
import { scaleUpByTouched, vectPrecision } from "model/3d/three.model";
import * as Geom from "model/geom";
import { StageSelection, StagePointerEvent, StageKeyEvent } from "model/stage/stage.model";
import { geomService } from "model/geom.service";

const Selection: React.FC<Props> = ({ selection, ptrWire, keyWire }) => {
  const group = useRef<THREE.Group>(null);

  const rectMesh = useRef<THREE.Mesh>(null);
  const rectGeom = useRef(geomService.createSquareGeometry()).current;
  const polysMesh = useRef<THREE.Mesh>(null);
  const [polysGeom, setPolysGeom] = useState(geomService.polysToGeometry(selection.polygons));
  const [outlineGeom, setOutlineGeom] = useState(geomService.polysToGeometry([]));
  const polysGroup = useRef<THREE.Group>(null);
  const dragging = useRef(false);
  const dragStart = useRef(new THREE.Vector3).current;

  useEffect(() => {// Initialize and rehydrate
    selection.group = group.current!;
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

  const setPolysFaded = useCallback((faded: boolean) => {
    (polysMesh.current!.material as THREE.Material).opacity = faded ? 0.1 : 0.2;
  }, []);

  useEffect(() => {// Handle mouse/keys when unlocked
    if (selection.locked) return;

    const [position, scale] = [rectMesh.current!.position, rectMesh.current!.scale];
    let [ptr, ptrDown, lastKeyMsg] = [new THREE.Vector3, false, {} as StageKeyEvent];

    const ptrSub = ptrWire.subscribe(({ key, point }) => {

      if (ptrDown && key === 'pointermove') {
        ptr.copy(point);
        scale.set(ptr.x - position.x, ptr.y - position.y, 1);
      } else if (key === 'pointerdown') {
        ptrDown = true;
        position.copy(ptr.copy(point))
        selection.cursor.copy(position);
        scale.set(0, 0, 0);
        if (!selection.additive && !lastKeyMsg.metaKey && !lastKeyMsg.shiftKey) {
          setPolysFaded(true); // Fade to indicate impending deletion
        }
      } else if (ptrDown && key === 'pointerup') {
        ptrDown = false;
        scale.set(0, 0, 0);
        setPolysFaded(false);
        if (Geom.Rect.fromPoints(position, ptr).area < 0.01 * 0.01) {
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
        setPolysFaded(false);
      }
    });

    const [blue, red] = [geomService.getColor('#00f'), geomService.getColor('#f00')];
    const keySub = keyWire.subscribe((msg) => {
      lastKeyMsg = msg;
      (rectMesh.current!.material as THREE.MeshBasicMaterial).color = msg.shiftKey ? red : blue;
      if (ptrDown) {
        setPolysFaded(!(msg.metaKey || msg.shiftKey || selection.additive));
        if (msg.key === 'Escape') {
          position.copy(ptr);
          scale.set(0, 0, 1);
          ptrDown = false;
          setPolysFaded(false);
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
    const [position, ptr] = [polysGroup.current!.position, new THREE.Vector3];

    const ptrSub = ptrWire.subscribe(({ key, point }) => {
      if (!dragging.current) {
        return;
      } else if (key === 'pointermove') {
        ptr.copy(point);
        position.copy(ptr).sub(dragStart);
      } else if (key === 'pointerup' || key === 'pointerleave') {
        dragging.current = false;
        vectPrecision(position, 1);
        // Apply transform
        /**
         * TODO prevent flicker by changing before trigger render
         */
        selection.polygons.map(x => x.add(position).precision(1));
        restoreFromState(selection);
        position.set(0, 0, 0);
      }
    });

    return () => { ptrSub.unsubscribe(); };
  }, [selection]);

  useEffect(() => {// Listen for external updates to polygons
    restoreFromState(selection);
  }, [selection.polygons]);

  return (
    <group ref={group} name="SelectionGroup">
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
          ref={polysMesh}
          geometry={polysGeom}
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
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
