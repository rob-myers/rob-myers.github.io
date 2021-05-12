import { geom } from "model/geom.service";
import { useState } from "react";

const Axes: React.FC = () => {
  const [xAxis] = useState(geom.createAxis('x', '#500', 1));
  const [yAxis] = useState(geom.createAxis('y', '#030', 1));
  const [zAxis] = useState(geom.createAxis('z', '#005', 1));

  return (
    <group position={[0, 0, 0.005]}>
      <primitive object={xAxis} matrixAutoUpdate={false} />
      <primitive object={yAxis}/>
      <primitive object={zAxis} matrixAutoUpdate={false}/>
    </group>
  );
};

export default Axes;
