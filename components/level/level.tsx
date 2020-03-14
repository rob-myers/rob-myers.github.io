import { useEffect } from 'react';
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

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.createLevel({ uid }));
    })();

    return () => {
      dispatch(Thunk.destroyLevel({ uid }));
    };
  }, []);

  return (
    <div className={css.root}>
      {state &&
        <LevelKeys levelUid={uid}>
          <LevelMenu levelUid={uid} />
          <svg className={css.svg} >
            {/* <pattern // Stripe pattern
              id='stripe-pattern' width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
              <rect width="0.2" height="4" fill="#000"></rect>
            </pattern> */}
            <LevelMouse levelUid={uid} />
            <g style={{ transform: `scale(${state.zoomFactor})` }}>
              {state.editMode === 'make' && <LevelGrid levelUid={uid} />}
              <g
                className={css.svgInnerGroup} 
                style={{ transform: `translate(${-state.renderBounds.x}px, ${-state.renderBounds.y}px)` }}
              >
                <LevelContent levelUid={uid} showNavGraph={false} />
                {state.editMode === 'make' && <LevelCursor levelUid={uid} />}
              </g>
            </g>
          </svg>
        </LevelKeys>
      }
    </div>
  );
};

interface Props {
  uid: string;
}

export default Level;
