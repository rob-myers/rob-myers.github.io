import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { geom } from "model/geom.service";
import { StageLightLookup, StageOpts, StagePoly } from "model/stage/stage.model";

const World: React.FC<Props> = ({ opts, poly, light, updateShadowMap }) => {
  const walls = useRef<THREE.Mesh>(null);
  const wallsBase = useRef<THREE.Mesh>(null);
  const obstructions = useRef<THREE.Mesh>(null);
  const navigable = useRef<THREE.Mesh>(null);
  const lights = useRef<THREE.Group>(null);
  const pointLight = useRef<THREE.PointLight>(null);

  useEffect(() => {
    navigable.current!.geometry = geom.polysToGeometry(poly.nav);
    obstructions.current!.geometry = geom.polysToWalls(poly.obs, 0.1);
    walls.current!.geometry = geom.polysToWalls(poly.wall, opts.wallHeight);
    wallsBase.current!.geometry = walls.current!.geometry;
    pointLight.current!.shadow.needsUpdate = true;
    updateShadowMap();
  }, [poly, opts.wallHeight]);

  const Lights = useMemo(() => 
    <group name="Lights" ref={lights}>
      {Object.values(light).map(({ key, position }) => (
        <pointLight
          key={key}
          position={position}
          intensity={3}
          decay={1.5}
          distance={4}
          castShadow
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
          shadow-autoUpdate={false}
          // shadow-bias={-0.01}
        />
      ))}
    </group>  
  , [light]);

  return (
    <group>
      <mesh name="GroundPlane" receiveShadow>
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
        scale={[1, 1, Math.sign(opts.wallOpacity)] }
      >
        <meshBasicMaterial color={opts.wallOpacity ? "#000" : "#888"} />
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
          color="#988"
        />
      </mesh>

      <mesh name="Navigable" ref={navigable} renderOrder={0} visible={false}>
        <meshBasicMaterial transparent opacity={0.1} color="#f00" />
      </mesh>

      <ambientLight
        color="#fff"
        intensity={opts.wallOpacity === 1 ? 0.15 : 0.3}
      />

      {Lights}

      <pointLight
        ref={pointLight}
        position={[1, 1, 2]}
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
  light: StageLightLookup;
  poly: StagePoly;
  updateShadowMap: () => void;
}

export default World;
