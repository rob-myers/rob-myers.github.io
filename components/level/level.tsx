import { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Thunk } from '@store/level.duck';
import LevelOverlay from './level-overlay';
import LevelCursor from './level-cursor';
// import LevelKeys from './level-keys';
// import LevelContent from './level-content';
import css from './level.scss';

const Level: React.FC<Props> = ({ uid, width, height, tileDim = 80 }) => {
  const root = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

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
      <svg className={css.svg}>
        {ready && 
          <>
            <LevelOverlay
              levelUid={uid}
              tileDim={tileDim}
            />
            {/* <LevelContent
              levelUid={uid}
            /> */}
            {/* <LevelKeys
              levelUid={uid}
              width={width}
              height={height}
            /> */}
            <LevelCursor
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
