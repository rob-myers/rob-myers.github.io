import { useEffect } from 'react';
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

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.createLevel({ uid }));
    })();

    return () => {
      dispatch(Thunk.destroyLevel({ uid }));
    };
  }, []);

  return (
    <section className={css.root}>
      {state &&
        <LevelKeys levelUid={uid}>
          <LevelMenu levelUid={uid} />
          <section className={css.viewport}>
            <svg className={css.svg} >
              <LevelMouse levelUid={uid} />
              <g style={{ transform: `scale(${state.zoomFactor})` }}>
                <g
                  className={css.svgInnerGroup} 
                  style={{ transform: `translate(${-state.renderBounds.x}px, ${-state.renderBounds.y}px)` }}
                >
                  <LevelContent
                    levelUid={uid}
                    showMeta={state.editMode === 'meta'}
                    showNavGraph={false}
                  />
                  {state.editMode === 'make' && <LevelCursor levelUid={uid} />}
                </g>
                {state.editMode === 'make' && <LevelGrid levelUid={uid} />}
              </g>
            </svg>
            {state.editMode === 'meta' && <LevelMeta levelUid={uid} />}
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
