import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Thunk } from '@store/level.duck';
import LevelSvgMouse from './level-svg-mouse';
import LevelKeys from './level-keys';
import LevelMenu from './level-menu';
import LevelMetaMenu from './level-meta-menu';
import LevelNotify from './level-notify';
import Level3d from './level-3d';
import LevelSvgGlobals from './level-svg-globals';
import LevelSvgWorld from './level-svg-world';
import css from './level.scss';

const Level: React.FC<Props> = ({ uid }) => {
  const dispatch = useDispatch();
  const showThreeD = useSelector(({ level: { instance } }) => instance[uid]?.showThreeD);
  const stateKey = useSelector(({ level: { instance } }) => instance[uid]?.key);
  const theme = useSelector(({ level: { instance } }) => instance[uid]?.theme);

  useEffect(() => {
    dispatch(Thunk.createLevel({ uid })).then(/** Level created */);
    return () => void dispatch(Thunk.destroyLevel({ uid }));
  }, []);

  return (
    <section className={classNames(css.root, css[theme], showThreeD && css.threeD)}>
      {stateKey &&
        <>
          <LevelNotify levelUid={uid} />
          <LevelKeys levelUid={uid}>
            <LevelMenu levelUid={uid} />
            <LevelMetaMenu levelUid={uid} />
            <section className={css.viewport}>
              <svg className={css.svg}>
                <LevelSvgGlobals />
                <LevelSvgMouse levelUid={uid} />
                <LevelSvgWorld levelUid={uid} />
              </svg>
              {showThreeD && <Level3d levelUid={uid} />}
            </section>
          </LevelKeys>
        </>
      }
    </section>
  );
};

interface Props {
  uid: string;
}

export default Level;
