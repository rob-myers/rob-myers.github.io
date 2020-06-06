import ConnectedLayout from '@components/golden-layout/connected-layout';
import css from './dev.scss';

const menuHeightPx = 25;

const DevEnvPage: React.FC = () => {
  return (
    <div className={css.root}>
      <div className={css.menu} style={{ height: menuHeightPx }}>
        Menu goes here
      </div>
      <ConnectedLayout width="100vw" height={`calc(100vh - ${menuHeightPx}px)`} />
    </div>
  );
};

export default DevEnvPage;
