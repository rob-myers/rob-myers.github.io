import {  MouseEvent } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { Thunk, Act } from '@store/dev-env.duck';
import Select from '@components/select/select';
import css from './dev-panel-menu.scss';

const DevPanelMenu: React.FC<Props> = ({ panelKey }) => {
  const filenames = useSelector(({ devEnv }) => Object.keys(devEnv.file));
  const isOpen = useSelector(({ devEnv }) => devEnv.panelToMeta[panelKey].menuOpen);

  const currentValue = useSelector(({ devEnv }) => {
    const meta = devEnv.panelToMeta[panelKey];
    // Both 'doc' and 'file' have a filename
    return meta.panelType === 'app'  ? 'app' : meta.filename;
  });

  const dispatch = useDispatch();
  const handleFileChange = (value: string) => {
    if (value === 'app') {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'app' } }));
    } else if (value.startsWith('docs/')) {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'doc', filename: value } }));
    } else {
      dispatch(Thunk.changePanel({ panelKey, next: { to: 'file', filename: value } }));
    }
  };
  const toggle = () => dispatch(Act.updatePanelMeta(panelKey,
    () => ({ menuOpen: !isOpen })));
  const preventToggle = (e: MouseEvent) => isOpen && e.stopPropagation();

  return (
    <div
      onClick={toggle}
      className={classNames(css.menuContainer, {
        [css.menuClosed]: !isOpen,
        [css.menuOpen]: isOpen,
      })}
    >
      <div
        className={css.menuOptions}
        onClick={preventToggle}
      >
        <div className={css.selectFileNew}>
          <Select
            items={[
              { itemKey: 'app', label: 'App' },
              ...filenames.map(filename => ({ itemKey: filename, label: filename })),
            ]}
            onChange={(itemKey) => handleFileChange(itemKey)}
            selectedKey={currentValue}
            disabled={!isOpen}
          />
        </div>
      </div>
      <div className={css.toggleIndicator}>
        {isOpen ? '✕' : '⋯'}
      </div>
    </div>
  );
};

interface Props {
  panelKey: string;
}

export default DevPanelMenu;
