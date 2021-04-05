import { useMemo } from "react";
import { DoubleSide, FrontSide } from "three";
import { geomService } from "model/geom.service";
import { StageMeta } from "model/stage/stage.model";

const Walls: React.FC<Props> = ({
  stage: { polygon, walls, opts }
}) => {

  const wallPolys = useMemo(() => walls.polygonKeys
    .map(x => polygon[x]).flatMap(x => x.polygons), [polygon, walls]);

  const wallsGeom = useMemo(() =>
    geomService.polysToWalls(wallPolys, opts.wallHeight), [wallPolys, opts.wallHeight]);

  const baseGeom = useMemo(() =>
    geomService.polysToGeometry(wallPolys.flatMap(x => x.createOutset(0.005)), 'xy', 0.005), [wallPolys]);

  const opacity = opts.wallOpacity;

  return (
    <group>
      <mesh
        key={opacity}
        geometry={wallsGeom}
        castShadow
        renderOrder={1}
      >
        <meshBasicMaterial
          side={DoubleSide}
          color={opts.wallColor}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh geometry={baseGeom}>
        <meshBasicMaterial
          side={FrontSide}
          color="#222"
        />
      </mesh>
    </group>
  );
};

interface Props {
  stage: StageMeta;
}

export default Walls;
