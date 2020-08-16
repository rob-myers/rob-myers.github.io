import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { posModulo } from '@model/generic.model';
import { tileDim } from '@model/env/env.model';
import css from './env.scss';

const LevelGrid: React.FC<Props> = ({ envKey }) => {
  const gridId = useRef(`grid-${envKey}`);
  const renderBounds = useSelector(({ env: { instance } }) => instance[envKey].renderBounds);
  const zoomFactor = useSelector(({ env: { instance } }) => instance[envKey].zoom);

  // Compute grid pattern offset
  const dx = -posModulo(renderBounds.x, tileDim);
  const dy = -posModulo(renderBounds.y, tileDim);

  return (
    <>
      <defs>
        <pattern id={gridId.current} x={dx} y={dy} width={tileDim} height={tileDim} patternUnits="userSpaceOnUse">
          <path
            className={css.svgGridPath}
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
  envKey: string;
}

export default LevelGrid;
