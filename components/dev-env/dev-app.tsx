import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { panelKeyToAppElId } from '@model/code/dev-env.model';
import { Act } from '@store/dev-env.duck';

const DevApp: React.FC<Props> = ({ panelKey }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(Act.rememberAppPanel({ panelKey }));
    return () => {
      dispatch(Act.forgetAppPanel({ panelKey }));
    };
  }, []);

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