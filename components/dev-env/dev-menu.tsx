import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import { menuHeightPx } from '@model/dev-env/dev-env.model';
import { getConfigPanelKeys } from '@model/layout/example-layout.model';
import { Act, Thunk } from '@store/dev-env.duck';
import { Thunk as LayoutThunk } from '@store/layout.duck';
import Select from '@components/select/select';
import css from './dev-menu.scss';

export const DevMenu = () => {
  const [disabled, setDisabled] = useState(true);
  const monacoLoaded = useSelector(({ editor: { monacoLoaded } }) => monacoLoaded);
  const monacoLoading = useSelector(({ editor: { monacoLoading } }) => monacoLoading);

  const packages = useSelector(({ devEnv }) => Object.keys(devEnv.package));
  const projects = useSelector(({ devEnv }) =>
    Object.values(devEnv.packagesManifest?.packages || {})
      .filter(x => x.project).map(x => x.key));

  /**
   * We disable controls initially or when monaco is loading.
   * This gives the web-workers time to load.
   */
  useEffect(() => {
    if (monacoLoaded) setDisabled(false);
    const id = setTimeout(() => setDisabled(false), 2000);
    return () => clearTimeout(id);
  }, []);

  const dispatch = useDispatch();
  const handleLayoutChange = (itemKey: string) => {
    const nextLayout = dispatch(LayoutThunk.setLayout({ layoutId: itemKey }));
    const nextPanelKeys = getConfigPanelKeys(nextLayout);
    dispatch(Act.restrictAppPortals({ panelKeys: nextPanelKeys }));
  };
  const handleOptionSelect = (itemKey: string) => {
    if (itemKey === 'save-project-as-json') {
      dispatch(Thunk.saveFilesToDisk({}));
    }
  };
  const handleProjectSelect = (_itemKey: string) => {
    // TODO
  };
  const handlePackageSelect = (_itemKey: string) => {
    // TODO
  };

  return (
    <div className={css.menu} style={{ height: menuHeightPx }}>
      <div className={css.toolbar}>

        <div className={css.logo}>
          com<span>(</span>mit<span>|</span>ment<span>)</span>
        </div>

        <div className={classNames(css.controls, {
          [css.controlsDisabled]: monacoLoading || disabled,
        })}>
          <div className={css.leftControls}>
            <Select
              items={[
                { itemKey: '', label: 'project' },
                ...projects.map(packageName => ({
                  itemKey: packageName, label: packageName,
                })),
                { itemKey: 'reset-project', label: 'reset project' },
              ]}
              onChange={handleProjectSelect}
              selectedKey=""
              showSelectedOption={false}
            />

            <Select
              items={[
                { itemKey: '', label: 'package' },
                ...packages.map(packageName => ({
                  itemKey: packageName, label: packageName,
                })),
              ]}
              onChange={handlePackageSelect}
              selectedKey=""
              showSelectedOption={false}
            />
          </div>

          <div className={css.rightControls}>

            <Select
              items={[
                { itemKey: '', label: 'opts' },
                { itemKey: 'save-project-as-json', label: 'save as json' },
              ]}
              onChange={handleOptionSelect}
              selectedKey=""
              showSelectedOption={false}
            />

            <Select
              items={[
                { itemKey: '', label: 'layout' },
                { itemKey: 'default-layout', label: 'default layout' },
              ]}
              onChange={handleLayoutChange}
              selectedKey=""
              showSelectedOption={false}
            />

            <div className={css.homeLink}>
              <Link href="/"><a>home</a></Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
