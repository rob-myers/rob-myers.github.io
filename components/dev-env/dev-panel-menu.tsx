import { ChangeEvent, MouseEvent } from 'react';
import classNames from 'classnames';
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
  const toggle = () => dispatch(Act.updatePanelMeta(panelKey, () => ({ menuOpen: !open })));
  const preventToggle = (e: MouseEvent) => e.stopPropagation();

  return (
    <div
      onClick={toggle}
      className={classNames(css.menuContainer, {
        [css.menuClosed]: !open,
      })}
    >
      {open && (
        <div className={css.menuOptions}>
          <select
            className={css.selectFile}
            value={currentValue}
            onChange={handleFileChange}
            onClick={preventToggle}
          >
            <option value="app">App</option>
            {filenames.map(filename =>
              <option key={filename} value={filename}>{filename}</option>)}
          </select>
        </div>
      )}
      {
        <div className={css.toggleIndicator}>
          {open ? '⇧' : '⋯'}
        </div>
      }
    </div>
  );
};

interface Props {
  panelKey: string;
}

export default DevPanelMenu;
