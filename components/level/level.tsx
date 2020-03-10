import { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Thunk } from '@store/level.duck';
import LevelOverlay from './level-overlay';
import LevelMouse from './level-mouse';
// import LevelKeys from './level-keys';
import LevelContent from './level-content';
import css from './level.scss';

const Level: React.FC<Props> = ({ uid, width, height, tileDim = 80 }) => {
  const root = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);
  const state = useSelector(({ level: { instance } }) => instance[uid]);

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.createLevel({ uid, tileDim }));
      root.current && setReady(true);
    })();

    return () => {
      dispatch(Thunk.destroyLevel({ uid }));
    };
  }, []);

  return (
    <div ref={root} style={{ width, height }}>
      <svg className={css.svg} >
        {ready && state &&
          <>
            <g style={{ transform: `scale(${state.zoomFactor})` }}>
              <LevelOverlay
                levelUid={uid}
                tileDim={tileDim}
              />
              <g style={{ transform: `translate(${-state.renderBounds.x}px, ${-state.renderBounds.y}px)` }}>
                <>
                  <LevelContent
                    levelUid={uid}
                  />
                  <rect
                    className={css.cursor}
                    x={state.cursor.x}
                    y={state.cursor.y}
                    width={tileDim}
                    height={tileDim}
                  />
                  {/* <LevelKeys
                  levelUid={uid}
                  width={width}
                  height={height}
                /> */}
                </>
              </g>
            </g>
            <LevelMouse
              levelUid={uid}
              tileDim={tileDim}
            />
          </>
        }
      </svg>
    </div>
  );
};

interface Props {
  uid: string;
  tileDim?: number;
  width: number;
  height: number;
}

export default Level;
