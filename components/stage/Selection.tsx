import { useEffect, useRef } from "react";
import { useThree } from "react-three-fiber";
import { Subject } from "rxjs";
import * as THREE from 'three';
import { ndCoordsToGround } from "model/3d/three.model";
import * as Geom from "model/geom";
import { StageSelection, StagePointerEvent, StageKeyEvent } from "model/stage/stage.model";
import { geomService } from "model/geom.service";
import useGeomStore from "store/geom.store";

const Selection: React.FC<Props> = ({ selection, ptrWire, keyWire }) => {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const cursorMesh = useRef<THREE.Mesh>(null);
  const rectMesh = useRef<THREE.Mesh>(null);
  const rectGeom = useRef(geomService.createSquareGeometry()).current;
  const cursorTexture = useGeomStore(({ texture }) => texture.thinPlusPng);

  useEffect(() => {
    selection.group = group.current!;
    const { x, y, e, s } = selection.lastRect;
    rectMesh.current!.position.set(x, y, 0);
    rectMesh.current!.scale.set(e - x, s - y, 0);
    return () => void delete selection.group;
  }, []);

  useEffect(() => {
    const [selector, ptr] = [rectMesh.current!, new THREE.Vector3];
    let ptrDown = false;
    
    const ptrSub = ptrWire.subscribe(({ key, ndCoords }) => {
      if (key === 'pointermove' && ptrDown) {
        ndCoordsToGround(ndCoords, camera, ptr);
        selector.scale.set(ptr.x - selector.position.x, ptr.y - selector.position.y, 1);
      } else if (key === 'pointerdown') {
        selector.position.copy(ndCoordsToGround(ndCoords, camera, ptr));
        selector.scale.set(0, 0, 1);
        cursorMesh.current!.position.copy(selector.position);
        ptrDown = true;
      } else if (key === 'pointerup' || key === 'pointerleave') {
        ptrDown = false;
        selection.lastRect.copy(Geom.Rect.fromPoints(selector.position, ptr));
      }
    });

    const [blue, red] = [geomService.getColor('#00f'), geomService.getColor('#f00')];

    const keySub = keyWire.subscribe(({ shiftKey }) => {
      const color = shiftKey ? red : blue;
      (rectMesh.current!.material as THREE.MeshBasicMaterial).color = color;
    });

    return () => {
      ptrSub.unsubscribe();
      keySub.unsubscribe();
    };
  }, []);

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
        <meshBasicMaterial
          color="#00f"
          transparent
          opacity={0.2}
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
