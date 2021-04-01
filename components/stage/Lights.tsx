import { useEffect, useRef } from "react";

const Lights: React.FC = () => {
  return (
    <group name="lights">
      {/* <ambientLight
        color="white"
        intensity={0}
      /> */}
      <pointLight
        // color="#aab"
        position={[0, 0, 1]}
        intensity={4}
        decay={2.5}
        distance={2.5}
        // power={8}
        // angle={Math.PI / 3}
        // penumbra={1}
        castShadow
        // shadow-mapSize-height={2048}
        // shadow-mapSize-width={2048}
      />
  </group>
  );
};

export default Lights;
