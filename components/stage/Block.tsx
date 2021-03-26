import { useMemo } from "react";
import { DoubleSide } from "three";
import { geomService } from "model/geom.service";
import { StageMeta } from "model/stage/stage.model";

const Block: React.FC<Props> = ({ stage, blockKey, flat }) => {

  const block = stage.block[blockKey];
  const polygons = block.polygonKeys
    .map(x => stage.polygon[x]).filter(Boolean);

  const geometry = useMemo(() => {
    const flattened = polygons.flatMap(x => x.polygons);
    return geomService.polysToWallsGeometry(flattened, flat ? 0 : block.height);
  }, [...polygons, flat]);

  return (
    <mesh geometry={geometry}>
      {/* <meshStandardMaterial side={DoubleSide} color="#444"/> */}
      <meshBasicMaterial
        side={DoubleSide}
        // transparent
        // opacity={1}
        color={block.color}
      />
    </mesh>
  );
};

interface Props {
  stage: StageMeta;
  blockKey: string;
  flat: boolean;
}

export default Block;
