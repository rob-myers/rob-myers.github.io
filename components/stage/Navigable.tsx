import { useMemo } from "react";
import { FrontSide } from "three";
import { CorePolygonKey, StageInternal, StageMeta, StageOpts } from "model/stage/stage.model";
import { geomService } from "model/geom.service";

const Navigable: React.FC<Props> = ({
  polygon,
  bounds,
  opts,
}) => {

  const { polygons: wallsPolys } = polygon[CorePolygonKey.walls];
  const { polygons: navPolys } = polygon[CorePolygonKey.navigable];
  
  /** Lighting and shadows drawn outside wall bases */
  const notWallsGeom = useMemo(() => {
    const inverted = geomService.invert(wallsPolys, bounds);
    return geomService.polysToGeometry(inverted);
  }, [bounds, wallsPolys]);
  
  const unNavigableGeom = useMemo(() => {
    const inverted = geomService.invert(navPolys, bounds);
    return geomService.polysToGeometry(inverted);
  }, [bounds, navPolys]);

  const wallsGeom = useMemo(() =>
    geomService.polysToGeometry(wallsPolys, 'xy', 0),
  [wallsPolys]);

  return (
    <group>
      <mesh
        geometry={notWallsGeom}
        renderOrder={-1}
        receiveShadow={opts.lights}
      >
        <meshStandardMaterial
          color={opts.wallOpacity || opts.lights ? "#fff" : "#777"}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh
        geometry={unNavigableGeom}
        renderOrder={-1}
      >
        <meshBasicMaterial
          color={opts.wallOpacity ? "#006" : "#000"}
          transparent
          opacity={0.13}
        />
      </mesh>
      <mesh
        geometry={wallsGeom}
        renderOrder={-1}
      >
        <meshBasicMaterial
          side={FrontSide}
          color={opts.wallOpacity ? "#000" : "#fff"}
          transparent
        />
      </mesh>
    </group>
  );
};

interface Props {
  bounds: StageInternal['bounds'];
  polygon: StageMeta['polygon'];
  opts: StageOpts;
}

export default Navigable;
