const Lights: React.FC<Props> = ({ enabled }) => {
  return (
    <group name="lights">
      <ambientLight
        color="#ffe"
        intensity={enabled ? 0.03 : 1}
      />
      {enabled && (
        <pointLight
          position={[0, 0, 3]}
          intensity={3}
          decay={2}
          distance={4}
          castShadow
          // color="#ddd"
          // power={18}
          // Saw unsightly white border for lower res shadow
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
        />
      )}
  </group>
  );
};

interface Props {
  enabled: boolean;
}

export default Lights;
