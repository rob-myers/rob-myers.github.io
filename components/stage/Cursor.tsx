import { useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { StageExtra, StagePointerEvent } from "model/stage/stage.model";
import { vectPrecision } from "model/3d/three.model";
import useGeomStore from "store/geom.store";

const Cursor: React.FC<Props> = ({ extra, ptrWire }) => {
  const group = useRef<THREE.Group>(null);
  const texture = useGeomStore(({ texture }) => texture.thinPlusPng);

  useEffect(() => {
    extra.cursorGroup = group.current!;
    extra.cursorGroup!.position.set(...extra.initCursorPos);
    return () => void delete extra.cursorGroup;
  }, []);
  
  useEffect(() => {
    const position = group.current!.position;
    const ptrSub = ptrWire.subscribe(({ key, point }) => {
      if (key === 'pointerup') {
        vectPrecision(position.copy(point), 1);
      }
      return () => ptrSub.unsubscribe();
    });
  }, []);

  return texture ? (
    <group ref={group}>
      <mesh>
        <planeGeometry args={[0.1, 0.1]} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  ) : null;
};

interface Props {
  extra: StageExtra;
  ptrWire: Subject<StagePointerEvent>;
}

export default Cursor;
