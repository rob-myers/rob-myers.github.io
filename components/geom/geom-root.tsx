import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Rect } from '@model/geom/rect.model';
import { traverseDom } from '@model/dom.model';
import { GeomRootState } from '@model/geom/geom-root.model';
import css from './geom.scss';

const GeomRoot: React.FC<Props> = ({ geomKey, transform, children }) => {
  const rootEl = useRef<SVGGElement>(null);
  const geomFile = useSelector<GeomRootState | undefined>(({ geom }) => geom.lookup[geomKey]);
  const [walls, setWalls] = useState({} as { [wallKey: string]: Rect });
  const dispatch = useDispatch();

  useEffect(() => {
    // Opening a geometry ensures it exists and tracks 'open count'
    dispatch({ type: '[geom] open geom', pay: { geomKey } });
    return () => {
      // Closing tracks the 'open count', it doesn't delete
      dispatch({ type: '[geom] close geom', pay: { geomKey } });
    };
  }, []);

  useEffect(() => {
    if (geomFile && rootEl.current) {
      console.log('recomputing GeomRoot', geomKey);
      /**
       * The parent of this component is a <g> whose CTM is the pan-zoom
       * transformation. We'll need to undo this transformation.
       */
      const invertedUiMatrix = DOMMatrix.fromMatrix(
        (rootEl.current.parentNode as SVGGElement).getCTM()!.inverse());
      const nextWalls = {} as typeof walls;

      traverseDom(rootEl.current, (el) => {
        if (el instanceof SVGRectElement) {
          const bbox = el.getBBox();
          const matrix = invertedUiMatrix.multiply((el.getCTM()!));
          const rect = Rect.fromPoints(
            matrix.transformPoint(bbox),
            matrix.transformPoint({ x: bbox.x + bbox.width, y: bbox.y + bbox.height }),
          );

          if (el.classList.contains(css.wall)) {
            nextWalls[`${rect}`] = rect;
          }
        }
      });
      
      const [prev, next] = [Object.keys(walls), Object.keys(nextWalls)];
      if (prev.length !== next.length || next.some(key => !walls[key])) {
        console.log('geometry has changed')
        /**
         * TODO compute & show navmesh
         */
        dispatch({ type: '[geom] recompute geom', args: { geomKey, walls: Object.values(nextWalls) } });

        setWalls(nextWalls);
      }
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
