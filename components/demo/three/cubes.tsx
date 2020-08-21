import { useRef, useState } from 'react';
import { Canvas, useFrame } from 'react-three-fiber';
import { Euler } from 'three';
import css from './three.scss';

export const RotatingCube: React.FC<RotatingCubeProps> = ({ position }) => {
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

interface RotatingCubeProps {
  position: [number, number, number];
}

const Cubes: React.FC = () => {
  return (
    <div className={css.root}>
      <Canvas>
        <ambientLight />
        <RotatingCube position={[-1.2, 0, 0]} />
        <RotatingCube position={[1.2, 0, 0]} />
      </Canvas>
    </div>
  );
};

export default Cubes;
