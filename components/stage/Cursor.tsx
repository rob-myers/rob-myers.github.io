import { useEffect, useRef } from "react";
import { Subject } from "rxjs";
import { StageInternal, StagePointerEvent } from "model/stage/stage.model";
import { vectPrecision } from "model/3d/three.model";
import useGeomStore from "store/geom.store";

const Cursor: React.FC<Props> = ({ internal, ptrWire }) => {
  const group = useRef<THREE.Group>(null);
  const texture = useGeomStore(({ texture }) => texture.thinPlusPng);

  useEffect(() => {
    if (!texture) return;
    group.current!.position.copy(internal.cursorGroup.position);
    internal.cursorGroup = group.current!;
    // Do not remove reference, so cursor available when stage paused
  }, [texture]);
  
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
  internal: StageInternal;
  ptrWire: Subject<StagePointerEvent>;
}

export default Cursor;
