import dynamic from 'next/dynamic';
import css from './dev-env.scss';

const DevEditor = dynamic(import('@components/dev-env/dev-editor'), { ssr: false });
// Had issue with portals and SSR
const DevApp = dynamic(import('@components/dev-env/dev-app'), { ssr: false });

const DevEnv: React.FC<Props> = ({ appRoot }) => {
  return (
    <div className={css.root}>
      <div style={{ width: 400, height: 500 }}>
        <DevEditor
          panelKey="test-code-panel"
          filename={appRoot}
        />
      </div>
      <div style={{ width: 400, height: 500 }}>
        <DevApp
          panelKey="test-dev-panel"
        />
      </div>
    </div>
  );
};

interface Props {
  appRoot: string;
}

export default DevEnv;
