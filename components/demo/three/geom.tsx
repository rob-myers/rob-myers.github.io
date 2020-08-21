export const Wall: React.FC<WallProps> = ({ p: [rx, ry], d: [rw, rh], h = 10 }) => {
  return (
    <mesh position={[rx + rw/2, ry - rh/2, h/2 ]}>
      <boxBufferGeometry attach="geometry" args={[rw, rh, h]} />
      <meshBasicMaterial attach="material" color="white" />
    </mesh>
  );
};

interface WallProps {
  /** Position (x, y) */
  p: [number, number];
  /** Dimension (width, height) */
  d: [number, number];
  /** Height (optional) */
  h?: number;
}

export const Table: React.FC<WallProps> = ({ p: [rx, ry], d: [rw, rh], h = 0.2 }) => {
  return (
    <mesh position={[rx + rw/2, ry - rh/2, h/2 ]}>
      <boxBufferGeometry attach="geometry" args={[rw, rh, h]} />
      <meshPhongMaterial attach="material" color="grey" flatShading />
    </mesh>
  );
};
