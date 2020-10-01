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
    <Physics gravity={gravity} >
      {actors.map((actor, index) => (
        <Actor
          key={actor.key}
          actor={actor}
          index={index}
        />
      ))}
    </Physics>
  );
};

interface Props {
  envName: string;
}

export default Actors;
