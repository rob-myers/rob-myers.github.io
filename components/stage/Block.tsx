import { useMemo } from "react";
import { DoubleSide } from "three";
import { geomService } from "model/geom.service";
import { StageBlock, StageMeta } from "model/stage/stage.model";

const Block: React.FC<Props> = ({ stage, block, flat }) => {

  const polygons = block.polygonKeys
    .map(x => stage.polygon[x]).filter(Boolean);

  const geometry = useMemo(() => {
    const flattened = polygons.flatMap(x => x.polygons);
    return geomService.polysToWallsGeometry(flattened, flat ? 0 : block.height);
  }, [...polygons, flat]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          side={DoubleSide}
          color={block.color}
        />
      </mesh>
    </group>
  );
};

interface Props {
  stage: StageMeta;
  block: StageBlock;
  flat?: boolean;
}

export default Block;
