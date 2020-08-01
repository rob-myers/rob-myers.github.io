import dynamic from 'next/dynamic';
import css from './dev-env.scss';

const DevEditor = dynamic(import('@components/dev-env/dev-editor'), { ssr: false });
// Had issue with portals and SSR
const DevApp = dynamic(import('@components/dev-env/dev-app'), { ssr: false });

const DevEnv: React.FC<Props> = ({ appRoot, envKey }) => {
  return (
    <div className={css.root}>
      <div style={{ width: 400, height: 500 }}>
        <DevEditor
          panelKey={`app.tsx@${envKey}`}
          filename={appRoot}
        />
      </div>
      <div style={{ width: 400, height: 500 }}>
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
  envKey: string;
}

export default DevEnv;
