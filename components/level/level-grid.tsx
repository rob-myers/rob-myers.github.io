import { useRef } from 'react';
import { useSelector } from 'react-redux';
import css from './level.scss';
import { tileDim, smallTileDim } from '@model/level/level.model';
import { posModulo } from '@model/generic.model';

const LevelGrid: React.FC<Props> = ({ levelUid }) => {
  const gridId = useRef(`grid-${levelUid}`);
  const cursorType = useSelector(({ level: { instance } }) => instance[levelUid].cursorType);
  const renderBounds = useSelector(({ level: { instance } }) => instance[levelUid].renderBounds);
  const zoomFactor = useSelector(({ level: { instance } }) => instance[levelUid].zoomFactor);

  // Compute grid pattern offset
  const td = cursorType === 'default' ? tileDim : smallTileDim;
  const dx = -posModulo(renderBounds.x, td);
  const dy = -posModulo(renderBounds.y, td);

  return (
    <>
      <defs>
        <pattern id={gridId.current} x={dx} y={dy} width={td} height={td} patternUnits="userSpaceOnUse">
          <path
            className={cursorType === 'refined' ? css.svgGridRefinedPath : css.svgGridPath}
            d={`M ${td} 0 L 0 0 0 ${td}`}
            fill="none"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect
        className={css.svgGrid}
        width={`${100 / zoomFactor}%`}
        height={`${100 / zoomFactor}%`}
        fill={`url(#${gridId.current})`}
      />
    </>
  );
};

interface Props {
  levelUid: string;
}

export default LevelGrid;
