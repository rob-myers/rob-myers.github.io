import { useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Thunk } from '@store/level.duck';
import LevelGrid from './level-grid';
import LevelMouse from './level-mouse';
import LevelKeys from './level-keys';
import LevelContent from './level-content';
import LevelCursor from './level-cursor';
import LevelMenu from './level-menu';
import css from './level.scss';

const Level: React.FC<Props> = ({ uid }) => {
  const dispatch = useDispatch();
  const state = useSelector(({ level: { instance } }) => instance[uid]);
  const viewportRef = useRef<HTMLElement>(null);

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.createLevel({ uid }));
    })();
    return () => void dispatch(Thunk.destroyLevel({ uid }));
  }, []);

  // Avoid re-rendering level
  const levelContent = useMemo(() => (
    state && <LevelContent
      levelUid={uid}
      showMeta={state.editMode === 'meta'}
      showNavGraph={false}
      viewportRef={viewportRef}
    />
  ), [state && state.editMode, viewportRef]);

  return (
    <section className={css.root}>
      {state &&
        <LevelKeys levelUid={uid}>
          <LevelMenu levelUid={uid} />
          <section className={css.viewport} ref={viewportRef}>
            <svg className={css.svg} >
              <LevelMouse levelUid={uid} />
              <g style={{ transform: `scale(${state.zoomFactor})` }}>
                <g style={{ transform: `translate(${-state.renderBounds.x}px, ${-state.renderBounds.y}px)` }}>
                  {levelContent}
                  {state.editMode === 'make' && <LevelCursor levelUid={uid} />}
                </g>
                {state.editMode === 'make' && <LevelGrid levelUid={uid} />}
              </g>
            </svg>
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
