import { panelKeyToRootId } from './dev-env.model';

const DevApp: React.FC<Props> = ({ panelKey }) => {
  // useEffect(() => {
  //   // dispatch(Thunk.bootstrapApp({ panelKey }));
  //   // dispatch(Thunk.unmountApp({ panelKey }));
  // }, []);

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