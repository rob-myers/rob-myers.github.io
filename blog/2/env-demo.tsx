import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Vector } from '@model/geom/vector.model';
import Env from '@components/env/env';
import GeomRoot from '@components/geom/geom-root';
import Table from '@components/geom/geom-table';
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
      <g>
      <Wall x={0} y={100} dx={400} dy={5} />
      <Wall x={400} y={100} dx={5} dy={200} />
      <Wall x={0} y={200} dx={5} dy={100} />
      
      <Wall x={0} y={100} dx={5} dy={50} />
      <Wall x={100} y={100} dx={5} dy={50} />
      <Wall x={200} y={100} dx={5} dy={50} />

      <Table x={100} y={200} dx={50} dy={100} />
      <Table x={200} y={200} dx={50} dy={100} />
      <Table x={300} y={200} dx={50} dy={100} />
      </g>
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
        width={800}
        height={400}
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
