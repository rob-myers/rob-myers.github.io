import { Physics } from '@react-three/cannon';
import { useMemo } from 'react';
import useEnvStore from '@store/env.store';
import Actor from './actor';

const gravity = [0, 0, 0];

const Actors: React.FC<Props> = ({ envName }) => {
  const director = useEnvStore(({ director }) => director[envName]);
  // Why can `director` be undefined on hot-reload?
  const actors = useMemo(() =>
    Object.values(director?.actor??{}), [director?.actor]);

  return (
    <group name="actors">
      <Physics gravity={gravity} >
        {actors.map(({ key }) => (
          <Actor
            key={key}
            envName={envName}
            actorName={key}
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
