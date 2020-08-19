import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RectJson, Rect } from '@model/geom/rect.model';
import { traverseDom } from '@model/dom.model';
import { GeomRootState } from '@model/geom/geom-root.model';
import css from './geom.scss';

const GeomRoot: React.FC<Props> = ({ geomKey, transform, children }) => {
  const rootEl = useRef<SVGGElement>(null);
  const geomFile = useSelector<GeomRootState | undefined>(({ geom }) => geom.lookup[geomKey]);
  const [walls, setWalls] = useState({} as { [wallKey: string]: RectJson });
  const dispatch = useDispatch();

  useEffect(() => {
    // Opening a geometry ensures it exists and tracks open count
    dispatch({ type: '[geom] open geom', pay: { geomKey } });
    return () => {
      // Closing tracks open count, it doesn't delete
      dispatch({ type: '[geom] close geom', pay: { geomKey } });
    };
  }, []);

  useEffect(() => {
    if (geomFile && rootEl.current) {
      console.log('recomputing GeomRoot', geomKey);
      const nextWalls = {} as typeof walls;

      traverseDom(rootEl.current, (el) => {
        if (el instanceof SVGRectElement) {
          const bbox = el.getBBox();
          const matrix = DOMMatrix.fromMatrix(el.getCTM()!);
          const tl = matrix.transformPoint(bbox);
          const br = matrix.transformPoint({ x: bbox.right, y: bbox.bottom });
          const rect = new Rect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

          if (el.classList.contains(css.wall)) {
            nextWalls[`${rect}`] = rect;
          }
        }
      });
      console.log({ nextWalls })
    }
  });

  return (
    <>
      <g style={{ transform }} ref={rootEl}>
        {children}
      </g>
      <g className={css.navigable}>
        {/* TODO show generated navmesh here */}
      </g>
    </>
  );
};

interface Props {
  geomKey: string;
  transform?: string;
}

export default GeomRoot;
