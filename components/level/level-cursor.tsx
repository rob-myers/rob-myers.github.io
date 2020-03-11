import { useSelector } from 'react-redux';
import css from './level.scss';
import { wallDepth } from '@model/level/level.model';

const LevelCursor: React.FC<Props> = ({ levelUid, tileDim }) => {
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);

  return (
    <g
      className={css.cursor}
      style={{ transform: `translate(${state.cursor.x}px, ${state.cursor.y}px)` }}
    >
      <rect
        width={tileDim}
        height={tileDim}
      />
      <g className={css.cursorLines}>
        <rect
          className={css.cursorLine}
          width={tileDim}
          height={wallDepth}
          onClick={(_e) => {
            // TODO toggle
          }}
        />
        <rect
          className={css.cursorLine}
          width={wallDepth}
          height={tileDim}
          x={tileDim - wallDepth}
        />
        <rect
          className={css.cursorLine}
          width={tileDim}
          height={wallDepth}
          y={tileDim - wallDepth}
        />
        <rect
          className={css.cursorLine}
          width={wallDepth}
          height={tileDim}
        />
      </g>

    </g>
  );
};

interface Props {
  levelUid: string;
  tileDim: number;
}

export default LevelCursor;
