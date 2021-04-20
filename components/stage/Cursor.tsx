import { useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { StagePointerEvent, StageSelection } from "model/stage/stage.model";
import { vectPrecision } from "model/3d/three.model";
import useGeomStore from "store/geom.store";

const Cursor: React.FC<Props> = ({ initial, ptrWire }) => {
  const cursorMesh = useRef<THREE.Mesh>(null);
  const cursorTexture = useGeomStore(({ texture }) => texture.thinPlusPng);

  useEffect(() => {
    cursorMesh.current?.position.set(initial.x, initial.y, 0);
  }, []);
  
  useEffect(() => {
    const position = cursorMesh.current!.position;
    const ptrSub = ptrWire.subscribe(({ key, point }) => {
    if (key === 'pointerup') {
      vectPrecision(position.copy(point), 1);
      initial.copy(position);
    }
    return () => { ptrSub.unsubscribe(); };
    });
  }, []);

  return cursorTexture && (
    <mesh ref={cursorMesh}>
      <planeGeometry args={[0.1, 0.1]} />
      <meshBasicMaterial map={cursorTexture} transparent />
    </mesh>
  );
};

interface Props {
  initial: StageSelection['cursor'];
  ptrWire: Subject<StagePointerEvent>;
}

export default Cursor;
