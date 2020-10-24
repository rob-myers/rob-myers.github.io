import * as portals from 'react-reverse-portal';
import useStore from '@store/env.store';
import Env from '@components/env/env';

/**
 * react-reverse-portals permits persistent
 * components over different pages.
 */
const Portals: React.FC = ({ children }) => {
  const envPortal = useStore(({ envPortal }) => envPortal);

  return (
    <>
      {children}
      <div>
        {Object.values(envPortal).map(({ key, portalNode }) => (
          <portals.InPortal key={key} node={portalNode}>
            <Env envKey="first" />
          </portals.InPortal>
        ))}
      </div>
    </>
  );
};

export default Portals;
