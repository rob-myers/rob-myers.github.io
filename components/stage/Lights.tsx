import { useEffect } from "react";

const Lights: React.FC<Props> = ({ enabled, updateShadows }) => {

  useEffect(() => {
    enabled && updateShadows();
  }, [enabled]);

  return (
    <group name="lights">
      <ambientLight
        color="#ffe"
        intensity={enabled ? 0.05 : 1}
      />
      {enabled && (
        <pointLight
          position={[0, 0, 3]}
          intensity={3}
          decay={1.5}
          distance={4}
          castShadow
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
        />
      )}
  </group>
  );
};

interface Props {
  enabled: boolean;
  updateShadows: () => void;
}

export default Lights;
