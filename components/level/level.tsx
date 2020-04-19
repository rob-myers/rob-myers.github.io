import { useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { Thunk } from '@store/level.duck';
import LevelGrid from './level-grid';
import LevelMouse from './level-mouse';
import LevelKeys from './level-keys';
import LevelContent from './level-content';
import LevelCursor from './level-cursor';
import LevelMenu from './level-menu';
import LevelMetaMenu from './level-meta-menu';
import LevelMetas from './level-metas';
import LevelNotify from './level-notify';
import Level3d from './level-3d';
import LevelSvgGlobals from './level-svg-globals';
import css from './level.scss';

const Level: React.FC<Props> = ({ uid }) => {
  const dispatch = useDispatch();
  const overlayRef = useRef<HTMLElement>(null);
  const stateKey = useSelector(({ level: { instance } }) => instance[uid]?.key);
  const renderBounds = useSelector(({ level: { instance } }) => instance[uid]?.renderBounds);
  const zoomFactor = useSelector(({ level: { instance } }) => instance[uid]?.zoomFactor);
  const mode = useSelector(({ level: { instance } }) => instance[uid]?.mode);
  const theme = useSelector(({ level: { instance } }) => instance[uid]?.theme);
  const showThreeD = useSelector(({ level: { instance } }) => instance[uid]?.showThreeD);

  useEffect(() => {
    dispatch(Thunk.createLevel({ uid })).then(/** Level created */);
    return () => void dispatch(Thunk.destroyLevel({ uid }));
  }, []);

  const levelContent = useMemo(
    () => stateKey && <LevelContent levelUid={uid} />, [stateKey]);
  
  const levelMetas = useMemo(() => (
    <LevelMetas levelUid={uid} overlayRef={overlayRef} />
  ), [overlayRef]);

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
                <LevelMouse levelUid={uid} />
                <g style={{ transform: scale }}>
                  <g style={{ transform: translate }}>
                    {levelContent}
                    {mode === 'edit' && <LevelCursor levelUid={uid} />}
                    {levelMetas}
                  </g>
                  {mode === 'edit' && <LevelGrid levelUid={uid} />}
                </g>
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
