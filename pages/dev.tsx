import { useSelector } from 'react-redux';
import ConnectedLayout from '@components/golden-layout/connected-layout';
import { DevMenu } from '@components/dev-env/dev-menu';
import css from './dev.scss';
import { menuHeightPx } from '@model/dev-env/dev-env.model';

const DevEnvPage: React.FC = () => {
  const loadingMonaco = useSelector(({ editor: { monacoLoading } }) => monacoLoading);
  const closable = useSelector(({ layout: { panel } }) => Object.keys(panel).length > 1);

  return (
    <div className={css.root}>
      <DevMenu />
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
