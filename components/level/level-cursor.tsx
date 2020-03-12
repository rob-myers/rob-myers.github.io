import { useSelector } from 'react-redux';
import classnames  from 'classnames';
import css from './level.scss';
import { wallDepth } from '@model/level/level.model';

const LevelCursor: React.FC<Props> = ({ levelUid, tileDim }) => {
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const { cursorHighlight: highlight } = state;

  return (
    <g
      className={css.cursor}
      style={{ transform: `translate(${state.cursor.x}px, ${state.cursor.y}px)` }}
    >
      <rect
        width={tileDim}
        height={tileDim}
      />
      <g>
        <rect
          className={classnames({ [css.highlight]: highlight.n })}
          width={tileDim}
          height={wallDepth}
        />
        <rect
          className={classnames({ [css.highlight]: highlight.e })}
          width={wallDepth}
          height={tileDim}
          x={tileDim - wallDepth}
        />
        <rect
          className={classnames({ [css.highlight]: highlight.s })}
          width={tileDim}
          height={wallDepth}
          y={tileDim - wallDepth}
        />
        <rect
          className={classnames({ [css.highlight]: highlight.w })}
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
