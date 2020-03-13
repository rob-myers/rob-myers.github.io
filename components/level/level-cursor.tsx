import { useSelector } from 'react-redux';
import classnames  from 'classnames';
import { wallDepth } from '@model/level/level.model';
import css from './level.scss';

const LevelCursor: React.FC<Props> = ({ levelUid, tileDim }) => {
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const { cursorHighlight: highlight } = state;

  return (
    <g
      className={css.cursor}
      style={{ transform: `translate(${state.cursor.x}px, ${state.cursor.y}px)` }}
    >
      <g style={{ transform: `scale(${state.cursorType === 'refined' ? 1/3 : 1 })` }}>
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
    </g>
  );
};

interface Props {
  levelUid: string;
  tileDim: number;
}

export default LevelCursor;
