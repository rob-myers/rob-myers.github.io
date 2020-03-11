import { useSelector } from 'react-redux';
import classnames  from 'classnames';
import css from './level.scss';
import { wallDepth } from '@model/level/level.model';

const LevelCursor: React.FC<Props> = ({ levelUid, tileDim }) => {
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);

  // We manually highlight side because using pointer-events breaks scrolling
  type Highlight = Partial<Record<'n' | 'e' | 's' | 'w', boolean>>;
  const highlight: Highlight = {
    n: state.mouseModulo.y <= wallDepth,
    e: state.mouseModulo.x >= tileDim - wallDepth,
    s: state.mouseModulo.y >= tileDim - wallDepth,
    w: state.mouseModulo.x <= wallDepth,
  };

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
          onClick={(_e) => {
            // TODO toggle
          }}
          onScroll={(e) => e.preventDefault()}
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
