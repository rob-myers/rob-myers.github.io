import { useEffect, useRef } from "react";
import * as THREE from "three";
import { geom } from "model/geom.service";
import { StageOpts, StagePoly } from "model/stage/stage.model";

const World: React.FC<Props> = ({ opts, poly, updateShadows }) => {
  const walls = useRef<THREE.Mesh>(null);
  const wallsBase = useRef<THREE.Mesh>(null);
  const obstructions = useRef<THREE.Mesh>(null);
  const navigable = useRef<THREE.Mesh>(null);
  const pointLight = useRef<THREE.PointLight>(null);

  useEffect(() => {
    navigable.current!.geometry = geom.polysToGeometry(poly.nav);
    obstructions.current!.geometry = geom.polysToWalls(poly.obs, 0.1);
    wallsBase.current!.geometry = walls.current!.geometry =
      geom.polysToWalls(poly.wall, opts.wallHeight);
    updateShadows();
    pointLight.current!.shadow.needsUpdate = true;
  }, [poly, opts.wallHeight]);

  useEffect(() => {
    updateShadows();
    pointLight.current!.shadow.needsUpdate = true;
  }, [opts.wallOpacity]);

  return (
    <group>
      <mesh name="Floor" receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#fff" />
      </mesh>

      <mesh name="Walls" ref={walls} castShadow>
        <meshBasicMaterial
          side={THREE.FrontSide}
          color="#000"
          transparent
          opacity={opts.wallOpacity}
          depthTest={opts.wallOpacity === 1}
        />
      </mesh>

      <mesh
        name="Obstructions"
        ref={obstructions}
        castShadow
        scale={opts.wallOpacity === 0 ? [1, 1, 0] : [1, 1, 1]}
      >
        <meshBasicMaterial
          color={opts.wallOpacity ? "#000" : "#666"}
        />
      </mesh>

      <mesh
        name="WallsBase"
        ref={wallsBase}
        renderOrder={0}
        receiveShadow
        scale={[1, 1, 0]}
        visible={opts.wallOpacity !== 1}
      >
        <meshStandardMaterial
          side={THREE.FrontSide}
          color="#777"
        />
      </mesh>

      <mesh
        name="Navigable"
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
        intensity={opts.wallOpacity === 1 ? 0.15 : 0.35}
      />
      <pointLight
        ref={pointLight}
        position={[0.5, 0.5, 2.5]}
        intensity={3}
        decay={1.5}
        distance={4}
        castShadow
        shadow-mapSize-height={2048}
        shadow-mapSize-width={2048}
        shadow-autoUpdate={false}
        // shadow-bias={-0.01}
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
