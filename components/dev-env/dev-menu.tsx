import Link from 'next/link';
import { useState, useEffect, ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import classNames from 'classnames';
import { menuHeightPx } from '@model/code/dev-env.model';
import { Thunk as LayoutThunk } from '@store/layout.duck';
import { Act } from '@store/dev-env.duck';
import css from './dev-menu.scss';
import { getConfigPanelKeys } from '@model/layout/example-layout.model';

export const DevMenu = () => {
  const [disabled, setDisabled] = useState(true);
  const monacoLoaded = useSelector(({ editor: { monacoLoaded } }) => monacoLoaded);
  const loadingMonaco = useSelector(({ editor: { monacoLoading } }) => monacoLoading);
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
  const handleLayoutChange = ({ target: { value } }: ChangeEvent<HTMLSelectElement>) => {
    const nextLayout = dispatch(LayoutThunk.setLayout({ layoutId: value }));
    const nextPanelKeys = getConfigPanelKeys(nextLayout);
    dispatch(Act.restrictAppPortals({ panelKeys: nextPanelKeys }));
  };

  return (
    <div className={css.menu} style={{ height: menuHeightPx }}>
      <div className={css.toolbar}>
        <div className={css.logo}>
          com<span>(</span>mit<span>|</span>ment<span>)</span>
        </div>
        <div className={classNames(css.controls, {
          [css.controlsDisabled]: loadingMonaco || disabled,
        })}>
          <select
            className={css.selectLayout} value={''}
            onChange={handleLayoutChange}
          >
            <option value={''}>layout</option>
            <option value={'default-layout'}>default layout</option>
          </select>
          <div className={css.separator}>|</div>
          <Link href="/"><a>home</a></Link>
        </div>
      </div>
      <div className={css.content} />
    </div>
  );
};
