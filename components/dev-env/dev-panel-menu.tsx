import { ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Thunk, Act } from '@store/dev-env.duck';
import css from './dev-panel.scss';

const DevPanelMenu: React.FC<Props> = ({ panelKey }) => {
  const filenames = useSelector(({ devEnv }) => Object.keys(devEnv.file));
  const open = useSelector(({ devEnv }) => devEnv.panelToMeta[panelKey].menuOpen);

  const currentValue = useSelector(({ devEnv }) => {
    const meta = devEnv.panelToMeta[panelKey];
    return meta.panelType === 'app' ? 'app' : meta.filename;
  });

  const dispatch = useDispatch();
  const handleFileChange = ({ target: { value } }: ChangeEvent<HTMLSelectElement>) => {
    if (value === 'app') {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'app' } }));
    } else {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'filename', filename: value } }));
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
        <option value="app">App</option>
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
