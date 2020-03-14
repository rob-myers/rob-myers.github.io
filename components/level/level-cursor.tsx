import { useSelector } from 'react-redux';
import classnames  from 'classnames';
import { wallDepth, tileDim, smallTileDim } from '@model/level/level.model';
import css from './level.scss';

const LevelCursor: React.FC<Props> = ({ levelUid }) => {
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);
  const { cursorHighlight: highlight } = state;
  const td = state.cursorType === 'default' ? tileDim : smallTileDim;

  return (
    <g
      className={css.cursor}
      style={{ transform: `translate(${state.cursor.x}px, ${state.cursor.y}px)` }}
    >
      <rect
        width={td}
        height={td}
      />
      <g>
        <rect
          className={classnames({ [css.highlight]: highlight.n })}
          width={td}
          height={wallDepth}
        />
        <rect
          className={classnames({ [css.highlight]: highlight.e })}
          width={wallDepth}
          height={td}
          x={td - wallDepth}
        />
        <rect
          className={classnames({ [css.highlight]: highlight.s })}
          width={td}
          height={wallDepth}
          y={td - wallDepth}
        />
        <rect
          className={classnames({ [css.highlight]: highlight.w })}
          width={wallDepth}
          height={td}
        />
      </g>
    </g>
  );
};

interface Props {
  levelUid: string;
}

export default LevelCursor;
