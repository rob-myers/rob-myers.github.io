import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Vector } from '@model/geom/vector.model';
import Env from '@components/env/env';
import GeomRoot from '@components/geom/geom-root';
import Wall from '@components/geom/geom-wall';

const initialHeight = 200; // ?

const EnvDemo: React.FC<Props> = ({ envKey }) => {
  const env = useSelector(({ env }) => env[envKey]);
  const [mouseScreen, setMouseScreen] = useState(Vector.zero);
  const [worldPos, setWorldPos] = useState(Vector.zero);
  const [zoom, setZoom] = useState(1);
  const [height, setHeight] = useState(initialHeight);

  useEffect(() => {
    if (env) {
      setMouseScreen(env.mouseScreen.clone().round());
      setWorldPos(env.renderBounds.center.round());
      setZoom(Number(env.zoom.toFixed(1)));
      setHeight(Math.round(initialHeight / env.zoom));
    }
  }, [env]);

  const geom = useMemo(() => (
    <GeomRoot geomKey={envKey}>
      {/* <g style={{ transform: 'translate(100px) scaleY(1)' }}> */}
        <Wall x={100} y={100} dx={200} dy={5} />
        {/* <g style={{ transform: 'translateX(100px)' }}> */}
          <Wall x={300} y={100} dx={5} dy={200} />
        {/* </g> */}
      {/* </g> */}
    </GeomRoot>
  ), []);

  return (
    <div style={{ overflow: 'auto' }}>
      <div style={{
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 12,
      }}>
        mouse({mouseScreen.x},{mouseScreen.y}) | 
        world({worldPos.x},{worldPos.y}) |
        zoom({zoom}) |
        height({height})
      </div>
      <Env
        envKey={envKey}
        geomKey={envKey}
        width={600}
        height={300}
      >
        {geom}
      </Env>
    </div>
  );
};

interface Props {
  envKey: string;
}

export default EnvDemo;
