import { useEffect, useRef } from "react";

const Lights: React.FC = () => {
  const lightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    lightRef.current!.shadow.mapSize.width = 1024;
    lightRef.current!.shadow.mapSize.height = 1024;
  }, [lightRef]);

  return (
    <group name="lights">
      {/* <ambientLight
        color="white"
        intensity={0}
      /> */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 4]}
        intensity={5}
        decay={1}
        distance={5}
        castShadow
      />
  </group>
  );
};

export default Lights;
