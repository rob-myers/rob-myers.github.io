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
    return geomService.polysToWalls(wallPolys, opts.wallHeight);
  }, [polygon, opts.wallHeight]);

  const innerGeom = useMemo(() => geometry.clone(), [geometry]);

  // When flat, force transparent so can see selections
  const opacity = opts.wallHeight === 0
    ? 0.15 : opts.wallOpacity;

  return (
    <group>
      <mesh key={opacity} geometry={geometry} castShadow>
        <meshBasicMaterial
          side={FrontSide}
          color={opts.wallColor}
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
            color={opts.wallColor}
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
