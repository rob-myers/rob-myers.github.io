import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EnvKeys from './env-keys';
import EnvMouse from './env-mouse';
import EnvDefs from './env-defs';
import Env2d from './env-2d';
import Env3d from './env-3d';
import css from './env.scss';

const Env: React.FC<Props> = ({ envKey, width, height }) => {
  const registered = useSelector(({ env: { instance } }) => envKey in instance);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: '[env] add env', pay: { envKey, dimension: { x: width, y: height } } });
    return () => void dispatch({ type: '[env] remove env', pay: { envKey } });
  }, []);

  return (
    // <section className={classNames(css.root, css[theme], showThreeD && css.threeD)}>
    <section
      className={css.root}
      style={{ width, height }}
    >
      {registered &&
        <EnvKeys envKey={envKey}>
          <section className={css.viewport}>
            <svg className={css.svg}>
              <EnvDefs />
              <EnvMouse envKey={envKey} />
              <Env2d envKey={envKey} />
            </svg>
            <Env3d envKey={envKey} />
          </section>
        </EnvKeys>
      }
    </section>
  );
};

interface Props {
  envKey: string;
  width: number;
  height: number;
}

export default Env;