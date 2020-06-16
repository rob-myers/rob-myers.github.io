import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { panelKeyToAppElId } from './dev-env.model';
import { Act } from '@store/dev-env.duck';

const DevApp: React.FC<Props> = ({ panelKey }) => {
  const initialized = useSelector(({ devEnv }) => devEnv.initialized);
  const dispatch = useDispatch();

  useEffect(() => {
    initialized && dispatch(Act.rememberAppPanel({ panelKey }));
    return () => {
      initialized && dispatch(Act.forgetAppPanel({ panelKey }));
    };
  }, [initialized]);

  return (
    <div
      id={panelKeyToAppElId(panelKey)}
      style={{ padding: 8, color: 'white' }}
    >
      App ({panelKey})
    </div>
  );
};

interface Props {
  panelKey: string;
}

export default DevApp;