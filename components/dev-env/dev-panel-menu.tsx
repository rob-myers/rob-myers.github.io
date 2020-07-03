import css from './dev-panel.scss';
import { useSelector } from 'react-redux';

const DevPanelMenu: React.FC<Props> = ({ panelKey }) => {
  const open = useSelector(({ devEnv }) =>
    devEnv.panelToMeta[panelKey]?.menuOpen || false);

  return open && (
    <div className={css.menuContainer}>
      Panel menu
    </div>
  ) || null;
};

interface Props {
  panelKey: string;
}

export default DevPanelMenu;
