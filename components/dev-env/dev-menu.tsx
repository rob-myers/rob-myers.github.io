import Link from 'next/link';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import css from './dev-menu.scss';
import { menuHeightPx } from '@model/code/dev-env.model';
import { useState, useEffect } from 'react';

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

  return (
    <div className={css.menu} style={{ height: menuHeightPx }}>
      <div className={css.toolbar}>
        <div className={css.logo}>
          com<span>(</span>mit<span>|</span>ment<span>)</span>
        </div>
        <div className={classNames(css.controls, {
          [css.controlsDisabled]: loadingMonaco || disabled,
        })}>
          <Link href="/"><a>🏠</a></Link>
        </div>
      </div>
      <div className={css.content} />
    </div>
  );
};
