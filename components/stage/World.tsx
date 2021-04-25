import { useEffect, useRef } from "react";
import * as THREE from "three";
import * as Geom from "model/geom";
import { geom } from "model/geom.service";
import { StageOpts, StagePoly } from "model/stage/stage.model";

const World: React.FC<Props> = ({ opts, poly, updateShadows }) => {
  const floorGeom = useRef(geom.createSquareGeometry()).current;
  const floor = useRef<THREE.Mesh>(null);
  const walls = useRef<THREE.Mesh>(null);
  const wallsBase = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const bounds = Geom.Rect.union(poly.wall.map(x => x.rect)).outset(2);
    floor.current!.position.set(bounds.x, bounds.y, 0);
    floor.current!.scale.set(bounds.width, bounds.height, 1);
    wallsBase.current!.geometry = geom.polysToGeometry(poly.wall);
    const wallPolys = poly.wall.flatMap(x => x.createInset(0.03));
    walls.current!.geometry = geom.polysToWalls(wallPolys, opts.wallHeight);
    updateShadows();
  }, [poly.wall, opts.wallHeight]);

  return (
    <group>
      <mesh
        ref={floor}
        geometry={floorGeom}
        receiveShadow
      >
        <meshStandardMaterial color="#fff" />
      </mesh>

      <mesh
        ref={walls}
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
        ref={wallsBase}
        renderOrder={1}
        receiveShadow
      >
        <meshStandardMaterial
          side={opts.wallOpacity === 1 ? THREE.DoubleSide : THREE.FrontSide}
          color={opts.wallOpacity ? "#999" : '#555'}
        />
      </mesh>

      <ambientLight
        color="#fff"
        intensity={0.1}
      />
      <pointLight
        // visible={enabled}
        position={[0.5, 0.5, 2.5]}
        intensity={3}
        decay={1.5}
        distance={4}
        castShadow
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
      />

    </group>
  );
};

interface Props {
  opts: StageOpts;
  poly: StagePoly;
  updateShadows: () => void;
}

export default World;
