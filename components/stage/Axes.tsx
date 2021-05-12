import { geom } from "model/geom.service";
import { useState } from "react";

const Axes: React.FC = () => {
  const [xAxis] = useState(geom.createAxis('x', '#500', 1000));
  const [yAxis] = useState(geom.createAxis('y', '#030', 1000));
  const [zAxis] = useState(geom.createAxis('z', '#005', 1000));

  return (
    <group>
      <primitive object={xAxis} />
      <primitive object={yAxis} />
      <primitive object={zAxis} />
    </group>
  );
};

export default Axes;
