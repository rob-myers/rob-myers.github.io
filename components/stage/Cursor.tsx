import { useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { useThree } from "react-three-fiber";
import { StagePointerEvent, StageSelection } from "model/stage/stage.model";
import { ndCoordsToGround, vectPrecision } from "model/3d/three.model";
import useGeomStore from "store/geom.store";

const Cursor: React.FC<Props> = ({ selection, ptrWire }) => {
  const { camera } = useThree();
  const cursorMesh = useRef<THREE.Mesh>(null);
  const cursorTexture = useGeomStore(({ texture }) => texture.thinPlusPng);

  useEffect(() => {
    cursorMesh.current?.position.set(selection.cursor.x, selection.cursor.y, 0);
  }, []);

  useEffect(() => {
    const position = cursorMesh.current!.position;
    const ptrSub = ptrWire.subscribe(({ key, ndCoords }) => {
      if (key === 'pointerup') {
        vectPrecision(ndCoordsToGround(ndCoords, camera, position), 1);
      }
      return () => { ptrSub.unsubscribe(); };
    });
  }, [selection]);

  return cursorTexture && (
    <mesh ref={cursorMesh}>
      <planeGeometry args={[0.1, 0.1]} />
      <meshBasicMaterial map={cursorTexture} />
    </mesh>
  );
};

interface Props {
  selection: StageSelection;
  ptrWire: Subject<StagePointerEvent>;
}

export default Cursor;
