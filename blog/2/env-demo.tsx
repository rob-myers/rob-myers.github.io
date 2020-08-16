import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Env from '@components/env/env';
import { Vector } from '@model/geom/geom.model';

const initialHeight = 200; // ?

const EnvDemo: React.FC = () => {
  const envKey = 'b2-d1';
  const env = useSelector(({ env }) => env.instance[envKey]);
  const [mouseScreen, setMouseScreen] = useState(Vector.zero);
  const [worldPos, setWorldPos] = useState(Vector.zero);
  const [zoom, setZoom] = useState(1);
  const [height, setHeight] = useState(initialHeight);

  useEffect(() => {
    if (env) {
      setMouseScreen(env.mouseScreen.clone().round());
      setWorldPos(env.renderBounds.center.round());
      setZoom(Math.round(env.zoom));
      setHeight(Math.round(initialHeight / env.zoom));
    }
  }, [env]);


  return (
    <div>
      <div style={{
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 12,
      }}>
        mouse({mouseScreen.x},{mouseScreen.y}) | 
        world({worldPos.x},{worldPos.y}) |
        zoom({zoom}) |
        height({height})
      </div>
      <Env envKey={envKey} width={600} height={300} />
    </div>
  );
};

export default EnvDemo;
