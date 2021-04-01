import { geomService } from "model/geom.service";
import { useState } from "react";


const Axes: React.FC = () => {
  
  const [xAxis] = useState(geomService.createAxis('x', '#006', 0.4));
  const [yAxis] = useState(geomService.createAxis('y', '#006', 0.4));

  return (
    <group position={[0, 0, 0.005]}>
      <primitive object={xAxis}/>
      <primitive object={yAxis}/>
    </group>
  );
};

export default Axes;
