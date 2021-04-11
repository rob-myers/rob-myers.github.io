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
  
  const { notWallsGeom, unNavigableGeom, wallsGeom } = useMemo(() => {
    return {
      /** Lighting and shadows drawn outside wall bases */
      notWallsGeom: geomService.polysToGeometry(
        geomService.invert(wallsPolys, bounds)),
      unNavigableGeom: geomService.polysToGeometry(
        geomService.invert(navPolys, bounds)),
      wallsGeom: geomService.polysToGeometry(wallsPolys),
    }
  }, [bounds, navPolys, wallsPolys]);
  
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
          transparent
          color="#000"
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
