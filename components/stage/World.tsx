import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { geom } from "model/geom.service";
import { StageLight, StageOpts, StagePoly } from "model/stage/stage.model";
import Bots from "./Bots";

const World: React.FC<Props> = ({ opt, poly, light, updateShadowMap }) => {
  const walls = useRef<THREE.Mesh>(null);
  const wallsBase = useRef<THREE.Mesh>(null);
  const obstructions = useRef<THREE.Mesh>(null);
  const navigable = useRef<THREE.Mesh>(null);
  const [lightsAt, updateLightAt] = useState(0);

  const Lights = useMemo(() => {
    Object.values(light).forEach(light => light.shadow.needsUpdate = true);
    updateShadowMap();
    return <group name="Lights">
      {Object.values(light).map((light) => [
        <primitive key={light.name} object={light} />,
        light.target && <primitive key={`${light.name}.dst`} object={light.target} />
      ])}
    </group>;
  }, [light, lightsAt]);

  useEffect(() => {
    navigable.current!.geometry = geom.polysToGeometry(poly.nav);
    obstructions.current!.geometry = geom.polysToWalls(poly.obs, 0.1);
    walls.current!.geometry = geom.polysToWalls(poly.wall, opt.wallHeight);
    wallsBase.current!.geometry = walls.current!.geometry;
    updateLightAt(Date.now());
  }, [poly, opt.wallHeight, opt.wallOpacity]);

  return (
    <group>
      <mesh name="GroundPlane" receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#fff" />
      </mesh>

      <mesh name="Walls" ref={walls} castShadow>
        <meshBasicMaterial
          side={THREE.DoubleSide} // Fixes shadows
          color="#000"
          transparent
          opacity={opt.wallOpacity}
          depthTest={opt.wallOpacity === 1}
        />
      </mesh>

      <mesh
        name="Obstructions"
        ref={obstructions}
        castShadow
        scale={[1, 1, Math.sign(opt.wallOpacity)] }
        >
        <meshBasicMaterial
          color={opt.wallOpacity ? "#000" : "#777"}
          side={THREE.DoubleSide} // Fixes shadows
        />
      </mesh>

      <mesh
        name="WallsBase"
        ref={wallsBase}
        renderOrder={0}
        receiveShadow
        scale={[1, 1, 0]}
        visible={opt.wallOpacity !== 1}
      >
        <meshStandardMaterial
          side={THREE.FrontSide}
          color="#988"
        />
      </mesh>

      <mesh
        name="Navigable"
        ref={navigable}
        renderOrder={0}
        visible={false}
      >
        <meshBasicMaterial transparent opacity={0.1} color="#f00" />
      </mesh>

      <ambientLight
        color="#fff"
        intensity={opt.ambientLight + (opt.wallOpacity === 1 ? 0 : 0.1)}
      />

      {Lights}

      <Bots/>

    </group>
  );
};

interface Props {
  opt: StageOpts;
  light: StageLight;
  poly: StagePoly;
  updateShadowMap: () => void;
}

export default World;
