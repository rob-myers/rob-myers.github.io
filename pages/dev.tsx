import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Thunk } from '@store/dev-env.duck';
import ConnectedLayout from '@components/golden-layout/connected-layout';
import css from './dev.scss';

const menuHeightPx = 30;

const DevEnvPage: React.FC = () => {
  const loadingMonaco = useSelector(({ editor: { monacoLoading } }) => monacoLoading);
  const closable = useSelector(({ layout: { panel } }) => Object.keys(panel).length > 1);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(Thunk.initFilesystem({}));
  }, []);

  return (
    <div className={css.root}>
      <div className={css.menu} style={{ height: menuHeightPx }}>
        Com(mit|ment)
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
