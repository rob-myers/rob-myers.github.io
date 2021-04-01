import { useMemo } from "react";
import { CorePolygonKey, StageMeta } from "model/stage/stage.model";
import { geomService } from "model/geom.service";
import { FrontSide } from "three";

const Navigable: React.FC<Props> = ({ stage }) => {

  const { polygons } = stage.polygon[CorePolygonKey.navigable];
  const geometry = useMemo(() => geomService.polysToGeometry(polygons), [polygons]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        side={FrontSide}
        color="#ccf"
        transparent
        opacity={0.5}
      />
    </mesh>
  );
};

interface Props {
  stage: StageMeta;
}

export default Navigable;
