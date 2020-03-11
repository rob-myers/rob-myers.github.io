import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Thunk } from '@store/level.duck';
import LevelGrid from './level-grid';
import LevelMouse from './level-mouse';
import LevelKeys from './level-keys';
import LevelContent from './level-content';
import LevelCursor from './level-cursor';
import css from './level.scss';

const Level: React.FC<Props> = ({ uid, tileDim = 60 }) => {
  const dispatch = useDispatch();
  const state = useSelector(({ level: { instance } }) => instance[uid]);

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.createLevel({ uid, tileDim }));
    })();

    return () => {
      dispatch(Thunk.destroyLevel({ uid }));
    };
  }, []);

  return (
    <div className={css.root}>
      {state &&
        <LevelKeys levelUid={uid}>
          <svg className={css.svg} >
            <g style={{ transform: `scale(${state.zoomFactor})` }}>
              <LevelGrid levelUid={uid} tileDim={tileDim} />
              <g style={{ transform: `translate(${-state.renderBounds.x}px, ${-state.renderBounds.y}px)` }}>
                <LevelContent levelUid={uid} />
                <LevelCursor levelUid={uid} tileDim={tileDim} />
              </g>
            </g>
            <LevelMouse levelUid={uid} tileDim={tileDim} />
          </svg>
        </LevelKeys>
      }
    </div>
  );
};

interface Props {
  uid: string;
  tileDim?: number;
}

export default Level;
