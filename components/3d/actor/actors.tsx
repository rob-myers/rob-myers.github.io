import { Physics } from '@react-three/cannon';
import { useMemo } from 'react';
import useEnvStore from '@store/env.store';
import Actor from './actor';

const Actors: React.FC<Props> = ({ envName }) => {
  const director = useEnvStore(({ director }) => director[envName]);
  // director.actor immutable, but not its items
  const actors = useMemo(() => Object.values(director.actor??{}), [director?.actor]);

  return (
    <group name="actors">
      <Physics>
        {actors.map(({ key }) => (
          <Actor
            id={key}
            envName={envName}
          />
        ))}
      </Physics>
      </group>
  );
};

interface Props {
  envName: string;
}

export default Actors;
