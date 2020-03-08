import LevelOverlay from './level-overlay';
import { useRef, useEffect } from 'react';
import LevelCursor from './level-cursor';
import css from './level.scss';
import { useDispatch } from 'react-redux';
import { Thunk } from '@store/level.duck';

const Level: React.FC<Props> = ({ uid, width, height, tileDim = 20 }) => {
  const mouseMove = useRef<(e: React.MouseEvent) => void>(() => null);
  const root = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.createLevel({ uid }));
    })();

    return () => {
      dispatch(Thunk.destroyLevel({ uid }));
    };
  }, []);

  return (
    <div ref={root} onMouseMove={(e) => mouseMove.current(e)}>
      <svg style={{ width, height }} className={css.svg}>
        <LevelOverlay
          width={width}
          height={height}
          tileDim={tileDim}
        />
        <LevelCursor
          provideHandler={(onMouseMove) => mouseMove.current = onMouseMove}
          root={root}
          tileDim={tileDim}
        />
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
