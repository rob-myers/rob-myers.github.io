import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import EnvFloor from './env-floor';
import EnvGrid from './env-grid';
// import css from './env.scss';

const Env2d: React.FC<Props> = ({ envKey }) => {
  const zoomFactor = useSelector(({ env: { instance } }) => instance[envKey]?.zoom);
  const renderBounds = useSelector(({ env: { instance } }) => instance[envKey]?.renderBounds);
  
  const scale = `scale(${zoomFactor || 1})`;
  const translate = renderBounds && `translate(${-renderBounds.x}px, ${-renderBounds.y}px)`;
  const levelContent = useMemo(() => <EnvFloor envKey={envKey} />, []);

  return (
    <g style={{ transform: scale }}>
      <g style={{ transform: translate }}>
        {levelContent}
      </g>
      <EnvGrid envKey={envKey} />
    </g>
  );
};

interface Props {
  envKey: string;
}

export default Env2d;
