import { StageSelection } from "model/stage/stage.model";
import { useCallback, useEffect, useRef } from "react";
import useGeomStore from "store/geom.store";

const Selection: React.FC<Props> = ({ selection }) => {
  const group = useRef<THREE.Group>(null);
  const rect = useRef<THREE.Mesh>(null);
  const cursorTexture = useGeomStore(({ texture }) => texture.thinPlusPng);

  useEffect(() => {
    selection.group = group.current!;
    return () => void delete selection.group;
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
        ref={rect}
        renderOrder={0} // Avoid occlusion by transparent walls
      >
          <planeGeometry args={[1, 1]} />
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
  selection: StageSelection;
}

export default Selection;
