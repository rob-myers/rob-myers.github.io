import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { RectJson } from '@model/geom/rect.model';
import { traverseDom } from '@model/dom.model';
import css from './geom.scss';

const GeomRoot: React.FC<Props> = ({ geomKey, transform, children }) => {
  const rootEl = useRef<SVGGElement>(null);
  const [ready, setReady] = useState(false);
  const [walls, setWalls] = useState({} as { [wallKey: string]: RectJson });
  const dispatch = useDispatch();

  useEffect(() => {
    if (!ready) {// Avoid rerun on hot-reload
      dispatch({ type: '[geom] open geom', pay: { geomKey } });
      setReady(true);
    }
    return () => {
      console.log('unmount...');
    };
  }, []);

  useEffect(() => {
    if (ready && rootEl.current) {
      console.log('recomputing GeomRoot', geomKey);
      const nextWalls = {} as typeof walls;
      traverseDom(rootEl.current, (el) => {
        if (el instanceof SVGRectElement) {
          if (el.classList.contains(css.wall)) {
            console.log('Found wall', el);
          }
        }
      });
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
