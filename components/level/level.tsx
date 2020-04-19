import { useEffect, useRef } from 'react';
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
  const overlayRef = useRef<HTMLElement>(null);
  const renderBounds = useSelector(({ level: { instance } }) => instance[uid]?.renderBounds);
  const showThreeD = useSelector(({ level: { instance } }) => instance[uid]?.showThreeD);
  const stateKey = useSelector(({ level: { instance } }) => instance[uid]?.key);
  const theme = useSelector(({ level: { instance } }) => instance[uid]?.theme);
  const zoomFactor = useSelector(({ level: { instance } }) => instance[uid]?.zoomFactor);

  useEffect(() => {
    dispatch(Thunk.createLevel({ uid })).then(/** Level created */);
    return () => void dispatch(Thunk.destroyLevel({ uid }));
  }, []);

  const scale = `scale(${zoomFactor})`;
  const translate = renderBounds && `translate(${-renderBounds.x}px, ${-renderBounds.y}px)`;

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
                <LevelSvgWorld levelUid={uid} overlayRef={overlayRef} />
              </svg>
              {showThreeD && <Level3d levelUid={uid} />}
              <div
                className={css.overlayContainer}
                style={{ transform: `${scale} ${translate}` }}
              >
                <section className={css.overlay} ref={overlayRef} />
              </div>
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
