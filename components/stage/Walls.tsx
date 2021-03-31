import { useMemo } from "react";
import { BackSide, FrontSide } from "three";
import { geomService } from "model/geom.service";
import { StageMeta } from "model/stage/stage.model";

const Walls: React.FC<Props> = ({ stage }) => {

  const polygons = stage.walls.polygonKeys
    .map(x => stage.polygon[x]).filter(Boolean);

  const geometry = useMemo(() => geomService.polysToWalls(
    polygons.flatMap(x => x.polygons),
    stage.walls.height,
  ), [...polygons, stage.walls.height]);

  const innerGeom = useMemo(() => geometry.clone(), [geometry]);

  // When flat, force transparent so can see selections
  const opacity = stage.walls.height === 0 ? 0.15 : stage.walls.opacity;

  return (
    <group>
      <mesh key={opacity} geometry={geometry}>
        <meshBasicMaterial
          side={FrontSide}
          color={stage.walls.color}
          {...opacity < 1 && {
            transparent: true,
            opacity,
          }}
        />
      </mesh>
      {opacity === 1 && (
        <mesh geometry={innerGeom}>
          <meshBasicMaterial
            side={BackSide}
            color={stage.walls.color}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
};

interface Props {
  stage: StageMeta;
}

export default Walls;
