import { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Thunk } from '@store/level.duck';
import LevelOverlay from './level-overlay';
import LevelCursor from './level-cursor';
import LevelContent from './level-content';
import css from './level.scss';

const Level: React.FC<Props> = ({ uid, width, height, tileDim = 50 }) => {
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
    <div ref={root} >
      <svg style={{ width, height }} className={css.svg}>
        <LevelOverlay
          width={width}
          height={height}
          tileDim={tileDim}
        />
        {ready && 
          <>
            <LevelContent
              levelUid={uid}
            />
            <LevelCursor
              levelUid={uid}
              root={root}
              width={width}
              height={height}
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
