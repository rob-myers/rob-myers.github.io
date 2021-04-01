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
        <planeBufferGeometry
          args={[bounds.width, bounds.height, 10, 10]}
        />
        <meshStandardMaterial
          color="#fff"
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* TODO consider shows inverse polygon as darker instead */}
      <mesh geometry={navGeometry}>
        <meshBasicMaterial
          color="#fff"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
};

interface Props {
  stage: StageMeta;
}

export default Navigable;
