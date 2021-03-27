import { useMemo } from "react";
import { BackSide, DoubleSide, FrontSide } from "three";
import { geomService } from "model/geom.service";
import { StageBlock, StageMeta } from "model/stage/stage.model";

const Block: React.FC<Props> = ({ stage, block }) => {

  const polygons = block.polygonKeys
    .map(x => stage.polygon[x]).filter(Boolean);

  const geometry = useMemo(() =>
    geomService.polysToWalls(
      polygons.flatMap(x => x.polygons),
      Math.min(block.height, stage.maxHeight),
  ), [...polygons, stage.maxHeight]);

  return (
    <group>
      <mesh key={stage.opacity} geometry={geometry}>
        <meshBasicMaterial
          side={stage.opacity === 1 ? DoubleSide : FrontSide}
          color={block.color}
          {...stage.opacity !== 1 && {
            transparent: true,
            opacity: stage.opacity,
          }}
        />
      </mesh>
    </group>
  );
};

interface Props {
  stage: StageMeta;
  block: StageBlock;
}

export default Block;
