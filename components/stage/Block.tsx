import { useMemo } from "react";
import { DoubleSide, FrontSide } from "three";
import { geomService } from "model/geom.service";
import { StageBlock, StageMeta } from "model/stage/stage.model";

const Block: React.FC<Props> = ({ stage, block }) => {

  const polygons = block.polygonKeys
    .map(x => stage.polygon[x]).filter(Boolean);

  const geometry = useMemo(() =>
    geomService.polysToWalls(
      polygons.flatMap(x => x.polygons),
      Math.min(block.height, stage.height),
  ), [...polygons, stage.height]);

  // When flat force opacity so can see selections
  const opacity = stage.height === 0 ? 0.2 : stage.opacity;

  return (
    <group>
      <mesh key={opacity} geometry={geometry}>
        <meshBasicMaterial
          side={opacity === 1 ? DoubleSide : FrontSide}
          color={block.color}
          {...opacity !== 1 && { transparent: true, opacity }}
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
