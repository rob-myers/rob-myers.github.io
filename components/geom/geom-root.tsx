import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GeomRootState } from '@model/geom/geom-root.model';
import css from './geom.scss';

const GeomRoot: React.FC<Props> = ({ geomKey, transform, children }) => {
  const rootEl = useRef<SVGGElement>(null);
  const file = useSelector<GeomRootState | undefined>(({ geom }) => geom.lookup[geomKey]);
  const ready = useSelector(({ geom }) => geom.serviceReady);
  const dispatch = useDispatch();

  useEffect(() => {
    // Opening a geometry ensures existence and tracks 'open count'
    dispatch({ type: '[geom] open geom', pay: { geomKey } });
    return () => {// Closing tracks 'open count', it doesn't delete
      dispatch({ type: '[geom] close geom', pay: { geomKey } });
    };
  }, []);

  useEffect(() => {
    if (ready && file && rootEl.current) {
      dispatch({ type: '[geom] recompute geom', args: {
        css,
        geomKey,
        rootEl: rootEl.current,
        /**
         * The parent of this component is a <g> whose CTM is the pan-zoom
         * transformation. We'll need to undo this transformation.
         */
        ancestralCtm: DOMMatrix.fromMatrix(
          (rootEl.current.parentNode as SVGGElement).getCTM()!.inverse()),
      }});
    }
  });

  return (
    <>
      <g style={{ transform }} ref={rootEl}>
        {children}
      </g>
      <g className={css.navigable}>
        {
          // TODO show navmesh here, 1 poly each
        }
        {file?.navGraphs.map(({ rects }, i) =>
          rects.map(({ x, y, width, height }, j) =>
            <rect
              key={`${i}-${j}`}
              x={x}
              y={y}
              width={width}
              height={height}
              strokeWidth={0.5}
              // stroke="rgba(200, 100, 100, 1)"
              fill="rgba(200, 100, 100, 0.2)"
            />
          )
        )}
      </g>
    </>
  );
};

interface Props {
  geomKey: string;
  transform?: string;
}

export default GeomRoot;
