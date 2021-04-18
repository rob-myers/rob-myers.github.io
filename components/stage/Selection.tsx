import { useEffect, useRef, useState } from "react";
import { useThree } from "react-three-fiber";
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

  useEffect(() => {
    selection.group = group.current!;
    const { x, y } = selection.lastCursor;
    cursorMesh.current?.position.set(x, y, 0);
    rectMesh.current?.scale.set(0, 0, 1);
    return () => void delete selection.group;
  }, []);

  useEffect(() => {
    switch (selection.selector) {
      case 'rectilinear': rectMesh.current!.scale.set(0, 0, 0); break;
      case 'rectangle': {
        const { x, y, e, s } = selection.lastRect;
        rectMesh.current!.position.set(x, y, 0);
        rectMesh.current!.scale.set(e - x, s - y, 1);
        break;
      }
    }
  }, [selection.selector]);

  useEffect(() => {
    const [position, scale] = [rectMesh.current!.position, rectMesh.current!.scale];
    const cursorPosition = cursorMesh.current!.position;
    let [ptr, ptrDown, shiftDown] = [new THREE.Vector3, false, false];

    const ptrSub = ptrWire.subscribe(({ key, ndCoords }) => {
      if (ptrDown && key === 'pointermove') {
        ndCoordsToGround(ndCoords, camera, ptr);
        scale.set(ptr.x - position.x, ptr.y - position.y, 1);
      } else if (key === 'pointerdown') {
        position.copy(ndCoordsToGround(ndCoords, camera, ptr));
        selection.lastCursor.copy(position);
        if (selection.selector === 'crosshair') {
          vectPrecision(cursorPosition.copy(position), 1);
        } else {
          ptrDown = true;
          scale.set(0, 0, 0);
        }
      } else if (ptrDown && key === 'pointerup') {
        ptrDown = false;

        if (Geom.Rect.fromPoints(position, ptr).area < 0.01 * 0.01) {
          scale.set(0, 0, 0);
        } else if (selection.selector === 'rectilinear') {
          scale.set(0, 0, 0);
          scaleUpByTouched(position, ptr);
          const rect = Geom.Rect.fromPoints(position, ptr);
          const polygons = shiftDown
            ? geomService.cutOut([Geom.Polygon.fromRect(rect)], selection.polygons)
            : geomService.union(selection.polygons.concat(Geom.Polygon.fromRect(rect)));
          polygons.forEach(x => x.precision(1)); // Increments of 0.1
          setPolysGeom(geomService.polysToGeometry(polygons));
          selection.polygons = polygons;
        } else if (selection.selector === 'rectangle') {
          scaleUpByTouched(position, ptr);
          scale.set(ptr.x - position.x, ptr.y - position.y, 1);
          selection.lastRect = Geom.Rect.fromPoints(position, ptr);
        }

      } else if (key === 'pointerleave') {
        ptrDown = false;
        // scale.set(0, 0, 0);
        selection.lastCursor.copy(position);
      }
    });

    const [blue, red] = [geomService.getColor('#00f'), geomService.getColor('#f00')];
    const keySub = keyWire.subscribe(({ shiftKey, key }) => {
      shiftDown = shiftKey;
      (rectMesh.current!.material as THREE.MeshBasicMaterial).color = shiftDown ? red : blue;
      if (key === 'Escape' && ptrDown && selection.selector === 'rectilinear') {
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

  useEffect(() => {
    setPolysGeom(geomService.polysToGeometry(selection.polygons));
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
        visible={selection.selector !== 'crosshair'}
      >
        <meshBasicMaterial color="#00f" transparent opacity={0.2} />
      </mesh>

      <mesh
        geometry={polysGeom}
        visible={selection.selector === 'rectilinear'}
      >
        <meshBasicMaterial color="#00f" transparent opacity={0.2} />
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
