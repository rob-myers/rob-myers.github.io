const Lights: React.FC<Props> = ({ enabled }) => {
  return (
    <group name="lights">
      {!enabled && (
        <ambientLight
          color="white"
          intensity={1}
        />
      )}
      {enabled && (
        <pointLight
          position={[0, 0, 1]}
          intensity={1}
          decay={2.5}
          distance={2.5}
          castShadow
          // color="#aab"
          // power={8}
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
