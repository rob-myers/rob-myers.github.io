import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { geom } from "model/geom.service";
import { StageBot, StageLight, StageOpts, StagePoly } from "model/stage/stage.model";
import Bots from "./Bots";

const World: React.FC<Props> = ({
  bot,
  opt,
  poly,
  updateLights,
}) => {
  const walls = useRef<THREE.Mesh>(null);
  const wallsBase = useRef<THREE.Mesh>(null);
  const obstructions = useRef<THREE.Mesh>(null);
  const navigable = useRef<THREE.Mesh>(null);

  useEffect(() => {
    walls.current!.geometry.dispose();
    obstructions.current!.geometry.dispose();
    walls.current!.geometry = geom.polysToWalls(poly.wall, opt.wallHeight);
    wallsBase.current!.geometry = walls.current!.geometry;
    obstructions.current!.geometry = geom.polysToWalls(poly.obs, 0.1);
    updateLights();
  }, [poly.wall, poly.obs, opt.wallHeight]);
  
  useEffect(() => {
    navigable.current!.geometry.dispose();
    navigable.current!.geometry = geom.polysToGeometry(poly.nav);
  }, [poly.nav]);

  const AllBots = useMemo(() => <Bots bot={bot} />, [bot]);

  return (
    <group>
      <mesh
        name="GroundPlane"
        receiveShadow
        matrixAutoUpdate={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#fff" />
      </mesh>

      <mesh
        name="Walls"
        ref={walls}
        castShadow
        matrixAutoUpdate={true}
      >
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
        matrixAutoUpdate={true}
      >
        <meshBasicMaterial
          color="#000"
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
        matrixAutoUpdate={opt.wallOpacity !== 1}
      >
        <meshBasicMaterial
          side={THREE.FrontSide}
          color="#555"
        />
      </mesh>

      <mesh
        name="Navigable"
        ref={navigable}
        renderOrder={0}
        // visible={false}
      >
        <meshBasicMaterial
          transparent
          opacity={0.1}
          color="#000"
        />
      </mesh>

      <ambientLight
        color="#fff"
        intensity={opt.ambientLight + (opt.wallOpacity === 1 ? 0 : 0.1)}
      />

      {AllBots}
    </group>
  );
};

interface Props {
  bot: StageBot;
  opt: StageOpts;
  poly: StagePoly;
  updateLights: () => void;
}

export default World;
