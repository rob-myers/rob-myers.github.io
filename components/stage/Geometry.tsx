import { useEffect, useRef } from "react";
import * as THREE from "three";
import { geom } from "model/geom.service";
import { StageOpts, StagePolyLookup } from "model/stage/stage.model";

const Geometry: React.FC<Props> = ({
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

  return (
    <group>
      <mesh
        name="GroundPlane"
        receiveShadow
        matrixAutoUpdate={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#777" />
      </mesh>

      <mesh
        name="Walls"
        ref={walls}
        castShadow
        matrixAutoUpdate={true}
      >
        <meshBasicMaterial
          side={THREE.DoubleSide} // Fixes shadows
          color="#fff"
          transparent
          opacity={opt.wallOpacity}
          depthTest={opt.wallOpacity === 1}
        />
      </mesh>

      <mesh
        name="Obstructions"
        ref={obstructions}
        castShadow
        matrixAutoUpdate={true}
      >
        <meshStandardMaterial
          color="#111"
          side={THREE.DoubleSide} // Fixes shadows
        />
      </mesh>

      <mesh
        name="WallsBase"
        ref={wallsBase}
        renderOrder={0}
        scale={[1, 1, 0]}
        visible={opt.wallOpacity !== 1}
        matrixAutoUpdate={opt.wallOpacity !== 1}
      >
        <meshBasicMaterial
          side={THREE.FrontSide}
          color="#444"
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
          color="#fff"
        />
      </mesh>
    </group>
  );
};

interface Props {
  opt: StageOpts;
  poly: StagePolyLookup;
  updateLights: () => void;
}

export default Geometry;
