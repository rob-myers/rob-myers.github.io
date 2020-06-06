import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import Layout from '@components/layout/layout';
import TopMenu from '@components/top-menu/top-menu';
import Gitalk from '@components/gitalk/gitalk';
import { exampleTsx1 } from '@model/code/examples';

const DevEnv = dynamic(import('@components/dev-env/dev-env'), { ssr: false });

const Home: React.FC = () => {
  const ready = useSelector(({ worker: { hasTranspiled } }) => !!hasTranspiled);

  return (
    <Layout>
      <TopMenu
        title="rob-myers"
        label="Robert S. R. Myers"
        disableLinks={!ready}
      />
      <DevEnv uid="demo" initialTsx={exampleTsx1} />
      <Gitalk />
    </Layout>  
  );
};

export default Home;
