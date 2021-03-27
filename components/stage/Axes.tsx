import { geomService } from "model/geom.service";
import { useState } from "react";


const Axes: React.FC = () => {
  
  const [xAxis] = useState(geomService.createAxis('x', '#600', 0.25));
  const [yAxis] = useState(geomService.createAxis('y', '#600', 0.25));

  return (
    <group>
      <primitive object={xAxis}/>
      <primitive object={yAxis}/>
    </group>
  );
};

export default Axes;
