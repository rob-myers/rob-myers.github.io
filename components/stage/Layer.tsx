import { useMemo } from "react";
import { DoubleSide } from "three";
import { geomService } from "model/geom.service";
import { StageLayer } from "model/stage/stage.model";

const Layer: React.FC<Props> = ({ layer }) => {

  const { editFlat } = layer.attrib;
  
  const geometry = useMemo(() =>
    geomService.polysToWallsGeometry(layer.polygons)
  , [layer.polygons]);

  return (
    <mesh
      position={editFlat ? [0, 0, -0.02] : undefined}
      scale={editFlat ? [1, 1, 0.01] : undefined}
      geometry={geometry}
    >
      {/* <meshStandardMaterial side={DoubleSide} color="#444"/> */}
      <meshBasicMaterial
        side={DoubleSide}
        transparent
        opacity={1}
        color="#000"
      />
    </mesh>
  );
};

interface Props {
  layer: StageLayer;
}

export default Layer;
