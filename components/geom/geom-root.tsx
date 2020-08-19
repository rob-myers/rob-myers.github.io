import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { RectJson } from '@model/geom/rect.model';

const GeomRoot: React.FC<Props> = ({ geomKey, transform, children }) => {
  const rootEl = useRef<SVGGElement>(null);
  const [ready, setReady] = useState(false);
  const [walls, setWalls] = useState({} as { [wallKey: string]: RectJson });
  const dispatch = useDispatch();

  useEffect(() => {
    if (!ready) {
      dispatch({ type: '[geom] open geom', pay: { geomKey } });
      setReady(true);
    }
  }, []);

  return (
    <g style={{ transform }} ref={rootEl}>
      {children}
    </g>
  );
};

interface Props {
  geomKey: string;
  transform?: string;
}

export default GeomRoot;
