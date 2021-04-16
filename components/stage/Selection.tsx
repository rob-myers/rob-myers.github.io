import { useEffect, useRef } from "react";
import { useThree } from "react-three-fiber";
import { Subject } from "rxjs";
import * as THREE from 'three';
import { ndCoordsToGround } from "model/3d/three.model";
import * as Geom from "model/geom";
import { StageSelection, PointerMsg } from "model/stage/stage.model";
import { geomService } from "model/geom.service";
import useGeomStore from "store/geom.store";

const Selection: React.FC<Props> = ({ ptrWire, selection }) => {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
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
    
    const sub = ptrWire.subscribe(({ key, ndCoords }) => {
      if (key === 'pointermove' && ptrDown) {
        ndCoordsToGround(ndCoords, camera, ptr);
        selector.scale.set(ptr.x - selector.position.x, ptr.y - selector.position.y, 1);
      } else if (key === 'pointerdown') {
        selector.position.copy(ndCoordsToGround(ndCoords, camera, ptr));
        selector.scale.set(0, 0, 1);
        ptrDown = true;
      } else if (key === 'pointerup') {
        ptrDown = false;
        selection.lastRect.copy(Geom.Rect.fromPoints(selector.position, ptr));
      }
    });
    return () => { sub.unsubscribe(); };
  }, []);

  return (
    <group ref={group}>

      {cursorTexture && (
        <mesh visible>
          <planeGeometry args={[0.2, 0.2]} />
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
  ptrWire: Subject<PointerMsg>;
  selection: StageSelection;
}

export default Selection;
