import { useMemo } from 'react';
import useEnvStore from '@store/env.store';
import Actor from './actor';

const Actors: React.FC<Props> = ({ envName }) => {
  const director = useEnvStore(({ director }) => director[envName]);
  // Why can `director` be undefined on hot-reload?
  const actors = useMemo(() =>
    Object.values(director?.actor??{}), [director?.actor]);

  return (
    <>
      {actors.map((actor) =>
        <Actor
          key={actor.key}
          actor={actor}
        />
      )}
    </>
  );
};

interface Props {
  envName: string;
}

export default Actors;
