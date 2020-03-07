import LevelOverlay from './level-overlay';
import { useRef } from 'react';
import LevelCursor from './level-cursor';
import css from './level.scss';

const Level: React.FC<Props> = ({ width, height, tileDim = 20 }) => {
  const mouseMove = useRef<(e: React.MouseEvent) => void>(() => null);
  const root = useRef<HTMLDivElement>(null);

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
  tileDim?: number;
  width: number;
  height: number;
}

export default Level;
