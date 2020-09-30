import { Physics, useBox } from '@react-three/cannon';

const Actors: React.FC = () => {
  return (
    <Physics>
      <group name="actors">
      </group>
    </Physics>
  );
};

export default Actors;
