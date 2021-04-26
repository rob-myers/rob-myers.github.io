import { useEffect, useRef } from "react";
import * as THREE from "three";
import * as Geom from "model/geom";
import { geom } from "model/geom.service";
import { StageOpts, StagePoly } from "model/stage/stage.model";

const World: React.FC<Props> = ({ opts, poly, updateShadows }) => {
  const walls = useRef<THREE.Mesh>(null);
  const wallsBase = useRef<THREE.Mesh>(null);
  const navigable = useRef<THREE.Mesh>(null);

  useEffect(() => {
    wallsBase.current!.geometry = geom.polysToGeometry(poly.wall);
    walls.current!.geometry = geom.polysToWalls(poly.wall, opts.wallHeight);
    const bounds = Geom.Polygon.fromRect(Geom.Rect.union(poly.wall.map(x => x.rect)));
    const nav = geom.cutOut(poly.wall.flatMap(x => x.createOutset(0.05)), [bounds]);
    navigable.current!.geometry = geom.polysToGeometry(nav);
    updateShadows();
  }, [poly.wall, opts.wallHeight]);

  return (
    <group>
      <mesh receiveShadow>
        <planeGeometry args={[100, 100]} />
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
        renderOrder={0}
        receiveShadow
        visible={opts.wallOpacity === 0}
      >
        <meshStandardMaterial
          side={opts.wallOpacity === 1 ? THREE.DoubleSide : THREE.FrontSide}
          color="#555"
        />
      </mesh>

      <mesh
        ref={navigable}
        renderOrder={0}
      >
        <meshBasicMaterial
          transparent
          opacity={0.2}
          color="#400"
        />
      </mesh>

      <ambientLight
        color="#fff"
        intensity={0.15}
      />
      <pointLight
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
