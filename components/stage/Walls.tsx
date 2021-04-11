import { useMemo } from "react";
import { DoubleSide, FrontSide } from "three";
import { geomService } from "model/geom.service";
import { StageMeta, StageOpts, StageWalls } from "model/stage/stage.model";

const Walls: React.FC<Props> = ({ polygon, walls, opts, updateShadows }) => {

  const wallsPolys = useMemo(() => walls.polygonKeys
    .map(x => polygon[x]).flatMap(x => x.polygons),
  [polygon, walls]);

  const wallsGeom = useMemo(() => {
    setTimeout(updateShadows, 20);
    return geomService.polysToWalls(wallsPolys, opts.wallHeight);
  }, [wallsPolys, opts.wallHeight]);

  return (
    <mesh
      key={opts.wallOpacity}
      geometry={wallsGeom}
      castShadow
      renderOrder={1}
    >
      <meshBasicMaterial
        side={opts.wallOpacity === 1 ? DoubleSide : FrontSide}
        color={opts.wallColor}
        transparent
        opacity={opts.wallOpacity}
      />
    </mesh>
  );
};

interface Props {
  opts: StageOpts;
  polygon: StageMeta['polygon'];
  walls: StageWalls;
  updateShadows: () => void;
}

export default Walls;
