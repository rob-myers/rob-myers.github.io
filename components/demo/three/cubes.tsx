import { useRef, useState } from 'react';
import { Canvas, useFrame,  } from 'react-three-fiber';
import { Euler } from 'three';

const Cubes: React.FC = () => {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </Canvas>
  );
};

const Box: React.FC<BoxProps> = ({ position }) => {
  const mesh = useRef<JSX.IntrinsicElements['mesh']>(null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useFrame(() => {
    const m = mesh.current as { rotation: Euler };
    m.rotation.x = m.rotation.y += 0.01;
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={(_e) => setActive(!active)}
      onPointerOver={(_e) => setHover(true)}
      onPointerOut={(_e) => setHover(false)}
    > 
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
};

interface BoxProps {
  position: [number, number, number];
}

export default Cubes;
