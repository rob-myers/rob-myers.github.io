import { useRef } from 'react';
import { useSelector } from 'react-redux';
import css from './level.scss';
import { tileDim, smallTileDim } from '@model/level/level.model';

const LevelGrid: React.FC<Props> = ({ levelUid }) => {
  const gridId = useRef(`grid-${levelUid}`);
  const state = useSelector(({ level: { instance } }) => instance[levelUid]);

  // Compute grid pattern offset
  const td = state.cursorType === 'default' ? tileDim : smallTileDim;
  const rect = state.renderBounds;
  const dx = -(rect.x > 0 ? rect.x % td : (rect.x % td) + td);
  const dy = -(rect.y > 0 ? rect.y % td : (rect.y % td) + td);

  return state ? (
    <>
      <defs>
        <pattern id={gridId.current} x={dx} y={dy} width={td} height={td} patternUnits="userSpaceOnUse">
          <path
            className={state.cursorType === 'refined' ? css.svgGridRefinedPath : css.svgGridPath}
            d={`M ${td} 0 L 0 0 0 ${td}`}
            fill="none"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect
        className={css.svgGrid}
        width={`${100 / state.zoomFactor}%`}
        height={`${100 / state.zoomFactor}%`}
        fill={`url(#${gridId.current})`}
      />
    </>
  ) : null;
};

interface Props {
  levelUid: string;
}

export default LevelGrid;
