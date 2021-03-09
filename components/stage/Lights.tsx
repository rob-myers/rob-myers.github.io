export const Lights: React.FC = () => {
  return (
    <group name="lights">
    <ambientLight
      color="white"
      intensity={1}
    />
    <pointLight
      position={[0, -4, 8]}
      intensity={1}
      decay={2}
      distance={20}
      // castShadow
    />
  </group>
  );
};
