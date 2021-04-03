import { useMemo } from "react";
import { BackSide, FrontSide } from "three";
import { geomService } from "model/geom.service";
import { StageMeta } from "model/stage/stage.model";

const Walls: React.FC<Props> = ({
  stage: { polygon, walls, opts }
}) => {

  const geometry = useMemo(() => {
    const wallPolys = walls.polygonKeys
      .map(x => polygon[x]).flatMap(x => x.polygons);
    return geomService.polysToWalls(wallPolys, opts.walls.height);
  }, [polygon, opts.walls.height]);

  const innerGeom = useMemo(() => geometry.clone(), [geometry]);

  // When flat, force transparent so can see selections
  const opacity = opts.walls.height === 0
    ? 0.15 : opts.walls.opacity;

  return (
    <group>
      <mesh key={opacity} geometry={geometry} castShadow>
        <meshBasicMaterial
          side={FrontSide}
          color={opts.walls.color}
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
            color={opts.walls.color}
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
