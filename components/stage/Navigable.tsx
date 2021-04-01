import { useMemo } from "react";
import { CorePolygonKey, StageMeta } from "model/stage/stage.model";
import { geomService } from "model/geom.service";

const Navigable: React.FC<Props> = ({ stage }) => {

  const { polygons } = stage.polygon[CorePolygonKey.navigable];
  const navGeometry = useMemo(() =>
    geomService.polysToGeometry(polygons), [polygons]);

  const { bounds } = stage;

  return (
    <group>
      <mesh position={[bounds.cx, bounds.cy, 0]} receiveShadow>
        <planeGeometry
          args={[bounds.width, bounds.height, 30, 30]}
        />
        <meshStandardMaterial
          color="#fff"
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh geometry={navGeometry}>
        <meshStandardMaterial
          color="#999"
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};

interface Props {
  stage: StageMeta;
}

export default Navigable;
