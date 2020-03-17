import { useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Thunk } from '@store/level.duck';
import LevelGrid from './level-grid';
import LevelMouse from './level-mouse';
import LevelKeys from './level-keys';
import LevelContent from './level-content';
import LevelCursor from './level-cursor';
import LevelMenu from './level-menu';
import LevelMetas from './level-metas';
import css from './level.scss';

const Level: React.FC<Props> = ({ uid }) => {
  const dispatch = useDispatch();
  const overlayRef = useRef<HTMLElement>(null);
  const stateKey = useSelector(({ level: { instance } }) => instance[uid]?.key);
  const renderBounds = useSelector(({ level: { instance } }) => instance[uid]?.renderBounds);
  const zoomFactor = useSelector(({ level: { instance } }) => instance[uid]?.zoomFactor);
  const editMode = useSelector(({ level: { instance } }) => instance[uid]?.editMode);

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.createLevel({ uid }));
    })();
    return () => void dispatch(Thunk.destroyLevel({ uid }));
  }, []);

  const levelContent = useMemo(() => (
    stateKey && <LevelContent levelUid={uid} showNavGraph={false} />
  ), [stateKey]);
  
  const levelMetas = useMemo(() => (
    editMode && <LevelMetas levelUid={uid} overlayRef={overlayRef} />
  ), [editMode, overlayRef]);

  const scale = `scale(${zoomFactor})`;
  const translate = renderBounds && `translate(${-renderBounds.x}px, ${-renderBounds.y}px)`;

  return (
    <section className={css.root}>
      {stateKey &&
        <LevelKeys levelUid={uid}>
          <LevelMenu levelUid={uid} />
          <section className={css.viewport}>
            <svg className={css.svg} >
              <LevelMouse levelUid={uid} />
              <g style={{ transform: scale }}>
                <g style={{ transform: translate }}>
                  {levelContent}
                  {editMode === 'make' && <LevelCursor levelUid={uid} />}
                  {levelMetas}
                </g>
                {editMode && <LevelGrid levelUid={uid} />}
              </g>
            </svg>
            <section
              className={css.overlayContainer}
              style={{ transform: `${scale} ${translate}` }}
            >
              <section className={css.overlay} ref={overlayRef} />
            </section>
          </section>
        </LevelKeys>
      }
    </section>
  );
};

interface Props {
  uid: string;
}

export default Level;
