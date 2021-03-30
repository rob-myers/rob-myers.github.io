import { useMemo } from "react";
import { BackSide, FrontSide } from "three";
import { geomService } from "model/geom.service";
import { StageBlock, StageMeta } from "model/stage/stage.model";

const Block: React.FC<Props> = ({ stage, block }) => {

  const polygons = block.polygonKeys
    .map(x => stage.polygon[x]).filter(Boolean);

  const geometry = useMemo(() => geomService.polysToWalls(
    polygons.flatMap(x => x.polygons),
    Math.min(block.height, stage.height),
  ), [...polygons, stage.height]);

  const innerGeom = useMemo(() => geometry.clone(), [geometry]);

  // When flat, force transparent so can see selections over black
  const opacity = stage.height === 0 ? 0.2 : stage.opacity;

  return (
    <group>
      <mesh key={opacity} geometry={geometry}>
        <meshBasicMaterial
          side={FrontSide}
          color={block.color}
          {...opacity < 1 && {
            transparent: true,
            opacity,
          }}
        />
      </mesh>
      {opacity === 1 && (
        <mesh geometry={innerGeom}>
          <meshBasicMaterial
            side={BackSide}
            color={block.color}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
};

interface Props {
  stage: StageMeta;
  block: StageBlock;
}

export default Block;
