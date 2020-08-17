import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { posModulo } from '@model/generic.model';
import { tileDim } from '@model/env/env.model';
import css from './env.scss';

const LevelGrid: React.FC<Props> = ({ envKey }) => {
  const gridId = useRef(`grid-${envKey}`);
  const largeGridId = useRef(`large-grid-${envKey}`);
  const renderBounds = useSelector(({ env: { instance } }) => instance[envKey].renderBounds);
  const zoomFactor = useSelector(({ env: { instance } }) => instance[envKey].zoom);

  // Compute grid pattern offset
  const dx = -posModulo(renderBounds.x, tileDim);
  const dy = -posModulo(renderBounds.y, tileDim);
  const Dx = -posModulo(renderBounds.x, 5 * tileDim);
  const Dy = -posModulo(renderBounds.y, 5 * tileDim);

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
        <pattern id={largeGridId.current} x={Dx} y={Dy} width={5 * tileDim} height={5 * tileDim} patternUnits="userSpaceOnUse">
          <path
            className={css.svgGridPath}
            d={`M ${5 * tileDim} 0 L 0 0 0 ${5 * tileDim}`}
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
      <rect
        className={css.svgGrid}
        width={`${100 / zoomFactor}%`}
        height={`${100 / zoomFactor}%`}
        fill={`url(#${largeGridId.current})`}
      />
    </>
  );
};

interface Props {
  envKey: string;
}

export default LevelGrid;
