import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import css from './dev-env.scss';

// Keep monaco-editor out of main bundle
const DevEditor = dynamic(import('@components/dev-env/dev-editor'), { ssr: false });
// react-reverse-portal incompatible with SSR
const DevApp = dynamic(import('@components/dev-env/dev-app'), { ssr: false });

const DevEnv: React.FC<Props> = ({ appRoot, scssRoot, envKey }) => {
  const ready = useSelector(({ devEnv }) => devEnv.flag.initialized);

  return (
    <div className={css.root}>
      <div className={css.filePanel}>
        {ready && <DevEditor
          panelKey={`app.tsx@${envKey}`}
          filename={appRoot}
        />}
      </div>
      <div className={css.filePanel}>
        {ready && <DevEditor
          panelKey={`index.scss@${envKey}`}
          filename={scssRoot}
        />}
      </div>
      <div className={css.appPanel}>
        <DevApp
          panelKey={`App@${envKey}`}
          appRoot={appRoot}
        />
      </div>
    </div>
  );
};

interface Props {
  appRoot: string;
  scssRoot: string;
  envKey: string;
}

export default DevEnv;
