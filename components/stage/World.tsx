import { useEffect, useRef } from "react";
import * as THREE from "three";
import { geom } from "model/geom.service";
import { StageOpts, StagePoly } from "model/stage/stage.model";

const World: React.FC<Props> = ({ opts, poly }) => {
  const wallsMesh = useRef<THREE.Mesh>(null);
  const wallsBaseMesh = useRef<THREE.Mesh>(null);

  useEffect(() => {
    wallsBaseMesh.current!.geometry = geom.polysToGeometry(poly.wall);
    const walls = poly.wall.flatMap(x => x.createInset(0.03));
    wallsMesh.current!.geometry = geom.polysToWalls(walls, opts.wallHeight);
  }, [poly.wall, opts.wallHeight]);

  return (
    <group>

      <mesh
        ref={wallsMesh}
        castShadow
        renderOrder={1}
      >
        <meshBasicMaterial
          side={opts.wallOpacity === 1 ? THREE.DoubleSide : THREE.FrontSide}
          color={opts.wallColor}
          transparent
          opacity={opts.wallOpacity}
        />
      </mesh>

      <mesh
        ref={wallsBaseMesh}
        renderOrder={1}
      >
        <meshBasicMaterial
          side={opts.wallOpacity === 1 ? THREE.DoubleSide : THREE.FrontSide}
          color="#999"
        />
      </mesh>

    </group>
  );
};

interface Props {
  opts: StageOpts;
  poly: StagePoly;
}

export default World;
