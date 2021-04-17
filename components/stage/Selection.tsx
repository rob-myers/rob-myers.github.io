import { useEffect, useRef, useState } from "react";
import { useThree } from "react-three-fiber";
import { Subject } from "rxjs";
import * as THREE from 'three';
import { ndCoordsToGround, scaleUpByTouched } from "model/3d/three.model";
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
    const [selector, ptr] = [rectMesh.current!, new THREE.Vector3];
    let [ptrDown, shiftDown] = [false, false];

    console.log('locked', selection.locked); // TODO

    const ptrSub = ptrWire.subscribe(({ key, ndCoords }) => {
      if (ptrDown && key === 'pointermove') {
        ndCoordsToGround(ndCoords, camera, ptr);
        selector.scale.set(ptr.x - selector.position.x, ptr.y - selector.position.y, 1);
      } else if (key === 'pointerdown') {
        ptrDown = true;
        selector.position.copy(ndCoordsToGround(ndCoords, camera, ptr));
        selector.scale.set(0, 0, 1);
        cursorMesh.current!.position.copy(selector.position);
        selection.lastCursor.copy(selector.position);
      } else if (ptrDown && key === 'pointerup') {
        ptrDown = false;
        selector.scale.set(0, 0, 0);
        scaleUpByTouched(selector.position, ptr);

        const rect = Geom.Rect.fromPoints(selector.position, ptr);
        const polygons = shiftDown
          ? geomService.cutOut([Geom.Polygon.fromRect(rect)], selection.polygons)
          : geomService.union(selection.polygons.concat(Geom.Polygon.fromRect(rect)));
        polygons.forEach(x => x.precision(1)); // Increments of 0.1

        setPolysGeom(geomService.polysToGeometry(polygons));
        selection.polygons = polygons;
      } else if (key === 'pointerleave') {
        ptrDown = false;
        selector.scale.set(0, 0, 0);
        selection.lastCursor.copy(selector.position);
      }
    });

    const [blue, red] = [geomService.getColor('#00f'), geomService.getColor('#f00')];

    const keySub = keyWire.subscribe(({ shiftKey, key }) => {
      shiftDown = shiftKey;
      (rectMesh.current!.material as THREE.MeshBasicMaterial).color = shiftDown ? red : blue;
      if (key === 'Escape' && ptrDown) {
        selector.position.copy(ptr);
        selector.scale.set(0, 0, 1);
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
    <group ref={group}>

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
      >
        <meshBasicMaterial color="#00f" transparent opacity={0.2} />
      </mesh>

      <mesh
        geometry={polysGeom}
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
