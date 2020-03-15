import { useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Thunk } from '@store/level.duck';
import LevelGrid from './level-grid';
import LevelMouse from './level-mouse';
import LevelKeys from './level-keys';
import LevelContent from './level-content';
import LevelCursor from './level-cursor';
import LevelMenu from './level-menu';
import LevelMeta from './level-meta';
import css from './level.scss';

const Level: React.FC<Props> = ({ uid }) => {
  const dispatch = useDispatch();
  const state = useSelector(({ level: { instance } }) => instance[uid]);
  const overlayRef = useRef<HTMLElement>(null);

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.createLevel({ uid }));
    })();
    return () => void dispatch(Thunk.destroyLevel({ uid }));
  }, []);

  const levelContent = useMemo(() => (
    state && <LevelContent levelUid={uid} showNavGraph={false} />
  ), [!!state]);
  
  const levelMeta = useMemo(() => (
    state && state.editMode === 'meta' && <LevelMeta levelUid={uid} overlayRef={overlayRef} />
  ), [state && state.editMode, overlayRef]);

  return (
    <section className={css.root}>
      {state &&
        <LevelKeys levelUid={uid}>
          <LevelMenu levelUid={uid} />
          <section className={css.viewport}>
            <svg className={css.svg} >
              <LevelMouse levelUid={uid} />
              <g style={{ transform: `scale(${state.zoomFactor})` }}>
                <g style={{ transform: `translate(${-state.renderBounds.x}px, ${-state.renderBounds.y}px)` }}>
                  {levelContent}
                  {levelMeta}
                  {state.editMode === 'make' && <LevelCursor levelUid={uid} />}
                </g>
                {state.editMode === 'make' && <LevelGrid levelUid={uid} />}
              </g>
            </svg>
            <section
              className={css.overlayContainer}
              style={{ transform: `scale(${state.zoomFactor}) translate(${-state.renderBounds.x}px, ${-state.renderBounds.y}px)` }}
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
