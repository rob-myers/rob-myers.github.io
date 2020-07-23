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
  const saveFilesAsJson = () => dispatch(Thunk.saveFilesToDisk({}));

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
            {/*
              TODO project/branch selectors in own component 
            */}
          </div>

          <div className={css.rightControls}>
            <div
              className={css.saveIcon}
              onClick={saveFilesAsJson}
            >
              💾
            </div>

            <div className={css.separator}>|</div>

            <Select
              items={[
                { itemKey: '', label: 'layout...' },
                { itemKey: 'default-layout', label: 'default layout' },
              ]}
              onChange={(itemKey) => handleLayoutChange(itemKey)}
              selectedKey=""
              showSelectedOption={false}
            />

            <div className={css.separator}>|</div>

            <Link href="/"><a>home</a></Link>

          </div>
        </div>
      </div>
    </div>
  );
};
