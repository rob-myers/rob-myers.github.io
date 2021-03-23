import { useMemo } from "react";
import { DoubleSide } from "three";
import * as Geom from 'model/geom';
import { geomService } from "model/geom.service";

const Walls: React.FC<Props> = ({ wallPolys }) => {

  const wallsGeometry = useMemo(() => {
    return geomService.polysToWallsGeometry(wallPolys);
  }, [wallPolys]);

  return (
    <mesh
      position={[0, 0, 0.01]}
      scale={[1, 1, 1]}
      geometry={wallsGeometry}
    >
      <meshStandardMaterial
        side={DoubleSide}
        color="#444"
      />
    </mesh>
  );
};

interface Props {
  wallPolys: Geom.Polygon[];
}

export default Walls;
