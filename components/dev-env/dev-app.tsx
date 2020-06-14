import { panelKeyToRootId } from './dev-env.model';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Thunk } from '@store/dev-env.duck';

const DevApp: React.FC<Props> = ({ panelKey }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(Thunk.bootstrapApp({ panelKey }));
    return () => dispatch(Thunk.unmountApp({ panelKey }));
  }, []);

  return (
    <div
      id={panelKeyToRootId(panelKey)}
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