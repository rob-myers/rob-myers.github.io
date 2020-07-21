import { ChangeEvent, MouseEvent } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { Thunk, Act } from '@store/dev-env.duck';
import css from './dev-panel.scss';

const DevPanelMenu: React.FC<Props> = ({ panelKey }) => {
  const filenames = useSelector(({ devEnv }) => Object.keys(devEnv.file));
  const isOpen = useSelector(({ devEnv }) => devEnv.panelToMeta[panelKey].menuOpen);
  const currentValue = useSelector(({ devEnv }) => {
    const meta = devEnv.panelToMeta[panelKey];
    return meta.panelType === 'app' 
      ? 'app' // 'app'
      : meta.filename; // 'file' or 'doc'
  });

  const dispatch = useDispatch();
  const handleFileChange = ({ target: { value } }: ChangeEvent<HTMLSelectElement>) => {
    if (value === 'app') {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'app' } }));
    } else if (value.startsWith('docs/')) {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'doc', filename: value } }));
    } else {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'file', filename: value } }));
    }
  };
  const toggle = () => dispatch(Act.updatePanelMeta(panelKey, () => ({ menuOpen: !isOpen })));
  const preventToggle = (e: MouseEvent) => e.stopPropagation();

  return (
    <div
      onClick={toggle}
      className={classNames(css.menuContainer, {
        [css.menuClosed]: !isOpen,
        [css.menuOpen]: isOpen,
      })}
    >
      <div className={css.menuOptions}>
        <select
          className={css.selectFile}
          value={currentValue}
          onChange={handleFileChange}
          onClick={preventToggle}
          disabled={!isOpen}
        >
          <option value="app">App</option>
          {filenames.map(filename =>
            <option key={filename} value={filename}>{filename}</option>)}
          {/* TODO doc filenames */}
        </select>
      </div>
      {
        <div className={css.toggleIndicator}>
          {isOpen ? '✕' : '⋯'}
        </div>
      }
    </div>
  );
};

interface Props {
  panelKey: string;
}

export default DevPanelMenu;
