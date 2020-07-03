import { ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Thunk, Act } from '@store/dev-env.duck';
import css from './dev-panel.scss';

const DevPanelMenu: React.FC<Props> = ({ panelKey }) => {
  const filenames = useSelector(({ devEnv }) => Object.keys(devEnv.file));
  const open = useSelector(({ devEnv }) => devEnv.panelToMeta[panelKey]?.menuOpen || false);
  const currentValue = useSelector(({ devEnv }) => {
    const meta = devEnv.panelToMeta[panelKey];
    return meta.panelType === 'app' ? 'App' : meta.filename;
  });

  const dispatch = useDispatch();
  const handleFileChange = ({ target: { value } }: ChangeEvent<HTMLSelectElement>) => {
    if (value === 'App') {
      dispatch(Thunk.changePanel({ panelKey, to: 'App' }));
    } else {
      dispatch(Thunk.changePanel({ panelKey, to: 'file', filename: value }));
    }
  };
  const closePanelMenu = () =>
    dispatch(Act.updatePanelMeta(panelKey, () => ({ menuOpen: false })));

  return open && (
    <div className={css.menuContainer}>
      <select
        className={css.selectFile}
        value={currentValue}
        onChange={handleFileChange}
      >
        <option value={'App'}>App</option>
        {filenames.map(filename =>
          <option key={filename} value={filename}>{filename}</option>)}
      </select>

      <div
        className={css.exitButton}
        onClick={closePanelMenu}
      >
        ✕
      </div>
    </div>
  ) || null;
};

interface Props {
  panelKey: string;
}

export default DevPanelMenu;
