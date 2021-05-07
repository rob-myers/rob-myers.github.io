import { useEffect, useRef } from "react";
import { StageInternal } from "model/stage/stage.model";
import { vectPrecision, vectPrecisionSpecial } from "model/3d/three.model";
import useGeomStore from "store/geom.store";

const Cursor: React.FC<Props> = ({ internal, locked }) => {
  const group = useRef<THREE.Group>(null);
  const texture = useGeomStore(({ texture }) => texture.thinPlusPng);

  useEffect(() => {
    if (!texture) return;
    group.current!.position.copy(internal.cursor.position);
    internal.cursor = group.current!;
    // We do not remove reference, so cursor available when stage paused
  }, [texture]);
  
  useEffect(() => {
    if (texture) {
      const position = group.current!.position;
      const ptrSub = internal.ptrEvents.subscribe(({ key, point }) => {
        if (key === 'pointerdown' && !locked) {
          vectPrecisionSpecial(position.copy(point));
        }
      });
      return () => ptrSub.unsubscribe();
    }
  }, [texture, locked]);

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
  locked: boolean;
}

export default Cursor;
