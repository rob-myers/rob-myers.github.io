import ConnectedLayout from '@components/golden-layout/connected-layout';
import css from './dev.scss';

const DevEnvPage: React.FC = () => {
  return (
    <div className={css.root}>
      <ConnectedLayout />
    </div>
  );
};

export default DevEnvPage;
