import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import EnvKeys from './env-keys';
import EnvMouse from './env-mouse';
import EnvDefs from './env-defs';
import Env2d from './env-2d';
import Env3d from './env-3d';
import css from './env.scss';

const Env: React.FC<Props> = ({ envKey, geomKey, width, height, children }) => {
  const [ready, setReady] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: '[env] add env', pay: { envKey, dimension: { x: width, y: height } } });
    setReady(true);
    return () => void dispatch({ type: '[env] remove env', pay: { envKey } });
  }, []);

  return (
    // <section className={classNames(css.root, css[theme], showThreeD && css.threeD)}>
    <section
      className={css.root}
      style={{ width, height }}
    >
      {ready &&
        <EnvKeys envKey={envKey}>
          <section className={css.viewport}>
            <svg className={css.svg}>
              <EnvDefs />
              <EnvMouse envKey={envKey} />
              <Env2d envKey={envKey}>
                {children}
              </Env2d>
            </svg>
            <Env3d envKey={envKey} geomKey={geomKey} />
          </section>
        </EnvKeys>
      }
    </section>
  );
};

interface Props {
  envKey: string;
  /**
   * Env should have a single child i.e. a GeomRoot, which has
   * a geomKey. We also provide this geomKey directly so Env3d
   * can read the induced 3d representation.
   */
  geomKey: string;
  width: number;
  height: number;
}

export default Env;
