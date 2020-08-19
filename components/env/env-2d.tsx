import { useSelector } from 'react-redux';
import EnvGrid from './env-grid';

const Env2d: React.FC<Props> = ({ envKey, children }) => {
  const zoomFactor = useSelector(({ env }) => env[envKey]?.zoom);
  const renderBounds = useSelector(({ env }) => env[envKey]?.renderBounds);
  
  const scale = `scale(${zoomFactor || 1})`;
  const translate = renderBounds && `translate(${-renderBounds.x}px, ${-renderBounds.y}px)`;

  return (
    <g style={{ transform: scale }}>
      <g style={{ transform: translate }}>
        {children /** GeomRoot */}
      </g>
      <EnvGrid envKey={envKey} />
    </g>
  );
};

interface Props {
  envKey: string;
}

export default Env2d;
