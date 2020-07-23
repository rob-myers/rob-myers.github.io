import * as portals from 'react-reverse-portal';
import { useSelector } from 'react-redux';
import { panelKeyToAppElId } from '@model/dev-env/dev-env.model';
import css from './app-portals.scss';

/**
 * Portals where runtime apps are rendered.
 * This permits persistence over different pages.
 */
const AppPortals: React.FC = ({ children }) => {
  const appPortal = useSelector(({ devEnv: { appPortal } }) => appPortal);

  return (
    <>
      {// Page contents
        children
      }
      <div className={css.appPortals}>
        {Object.values(appPortal).map(({ key: panelKey, portalNode }) => (
          <portals.InPortal key={panelKey} node={portalNode}>
            <div id={panelKeyToAppElId(panelKey)} style={{ height: '100%' }}>
              <div className={css.appNotMounted}>
                App is not mounted.
              </div>
            </div>
          </portals.InPortal>
        ))}
      </div>
    </>
  );
};

export default AppPortals;
