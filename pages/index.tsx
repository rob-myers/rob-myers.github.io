import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import Gitalk from '@components/gitalk/gitalk';
import TopMenu from '@components/top-menu/top-menu';

const DevEnv = dynamic(import('@components/dev-env/dev-env'), { ssr: false });

const Home: React.FC = () => {
  const someEditorReady = useSelector(({ worker: { monacoTypesLoaded } }) => !!monacoTypesLoaded);

  return (
    <section>
      <TopMenu
        title="rob-myers"
        label="Robert S. R. Myers"
        disableLinks={!someEditorReady}
      />
      <DevEnv />
      <Gitalk />
    </section>  
  );
};

export default Home;
