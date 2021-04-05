import { useMemo } from "react";
import { CorePolygonKey, StageMeta } from "model/stage/stage.model";
import { geomService } from "model/geom.service";

const Navigable: React.FC<Props> = ({ stage: {
  polygon,
  internal: { bounds },
  opts,
} }) => {

  const { polygons: wallPolys } = polygon[CorePolygonKey.walls];
  const { polygons: navPolys } = polygon[CorePolygonKey.navigable];
  
  /** Lighting and shadows drawn outside wall bases */
  const notWallsGeom = useMemo(() => {
    const inverted = geomService.invert(wallPolys, bounds);
    return geomService.polysToGeometry(inverted);
  }, [bounds, wallPolys]);
  
  const unNavigableGeom = useMemo(() => {
    const inverted = geomService.invert(navPolys, bounds);
    return geomService.polysToGeometry(inverted);
  }, [bounds, navPolys]);

  return (
    <group>
      {opts.lights && (
        <mesh
          geometry={notWallsGeom}
          renderOrder={-1}
          receiveShadow
        >
          <meshStandardMaterial
            color="#fff"
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      <mesh
        geometry={unNavigableGeom}
        renderOrder={-1}
      >
        <meshBasicMaterial
          color="#000"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

interface Props {
  stage: StageMeta;
}

export default Navigable;
