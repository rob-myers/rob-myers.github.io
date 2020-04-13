import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { posModulo } from '@model/generic.model';
import { tileDim } from '@model/level/level-params';
import css from './level.scss';

const LevelGrid: React.FC<Props> = ({ levelUid }) => {
  const gridId = useRef(`grid-${levelUid}`);
  const renderBounds = useSelector(({ level: { instance } }) => instance[levelUid].renderBounds);
  const zoomFactor = useSelector(({ level: { instance } }) => instance[levelUid].zoomFactor);

  // Compute grid pattern offset
  const dx = -posModulo(renderBounds.x, tileDim);
  const dy = -posModulo(renderBounds.y, tileDim);

  return (
    <>
      <defs>
        <pattern id={gridId.current} x={dx} y={dy} width={tileDim} height={tileDim} patternUnits="userSpaceOnUse">
          <path
            className={css.svgGridRefinedPath}
            d={`M ${tileDim} 0 L 0 0 0 ${tileDim}`}
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
        // fill={`url(${location.href}#small-${gridId.current})`}
      />
    </>
  );
};

interface Props {
  levelUid: string;
}

export default LevelGrid;
