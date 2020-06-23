import { useSelector } from 'react-redux';
import Link from 'next/link';
import ConnectedLayout from '@components/golden-layout/connected-layout';
import css from './dev.scss';

const menuHeightPx = 32;

const DevEnvPage: React.FC = () => {
  const loadingMonaco = useSelector(({ editor: { monacoLoading } }) => monacoLoading);
  const closable = useSelector(({ layout: { panel } }) => Object.keys(panel).length > 1);

  return (
    <div className={css.root}>
      <div className={css.menu} style={{ height: menuHeightPx }}>
        <div className={css.toolbar}>
          <div className={css.logo}>
            com<span>(</span>mit<span>|</span>ment<span>)</span>
          </div>
          <div className={css.controls}>
            <Link href="/"><a>🏠</a></Link>
          </div>
        </div>
        <div className={css.content} />
      </div>
      <ConnectedLayout
        width="100vw"
        height={`calc(100vh - ${menuHeightPx}px)`}
        disabled={loadingMonaco}
        closable={closable}
      />
    </div>
  );
};

export default DevEnvPage;
