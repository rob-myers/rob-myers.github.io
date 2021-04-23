import { geom } from "model/geom.service";
import { useState } from "react";


const Axes: React.FC = () => {
  
  const [xAxis] = useState(geom.createAxis('x', '#500', 0.3));
  const [yAxis] = useState(geom.createAxis('y', '#500', 0.3));

  return (
    <group position={[0, 0, 0.005]}>
      <primitive object={xAxis}/>
      <primitive object={yAxis}/>
    </group>
  );
};

export default Axes;
