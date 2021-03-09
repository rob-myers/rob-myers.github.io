export const Box: React.FC = () => {
  return (
    <mesh scale={[1, 1, 1]} position={[0, 0, 0.5]}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
};
