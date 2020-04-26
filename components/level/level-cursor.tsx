import { useSelector } from 'react-redux';
import classnames  from 'classnames';
import { cursorWallDepth, tileDim } from '@model/level/level-params';
import css from './level.scss';

const LevelCursor: React.FC<Props> = ({ levelUid }) => {
  const cursor = useSelector(({ level: { instance } }) => instance[levelUid]?.cursor);
  const highlight = useSelector(({ level: { instance } }) => instance[levelUid]?.cursorHighlight);

  return (
    <g
      className={css.cursor}
      style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
    >
      <rect
        width={tileDim}
        height={tileDim}
      />
      <g>
        <rect
          className={classnames({ [css.highlight]: highlight.n })}
          width={tileDim}
          height={cursorWallDepth}
        />
        <rect
          className={classnames({ [css.highlight]: highlight.e })}
          width={cursorWallDepth}
          height={tileDim}
          x={tileDim - cursorWallDepth}
        />
        <rect
          className={classnames({ [css.highlight]: highlight.s })}
          width={tileDim}
          height={cursorWallDepth}
          y={tileDim - cursorWallDepth}
        />
        <rect
          className={classnames({ [css.highlight]: highlight.w })}
          width={cursorWallDepth}
          height={tileDim}
        />
      </g>
    </g>
  );
};

interface Props {
  levelUid: string;
}

export default LevelCursor;
