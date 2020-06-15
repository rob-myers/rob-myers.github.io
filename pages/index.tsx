import Layout from '@components/layout/layout';
import TopMenu from '@components/top-menu/top-menu';
import Gitalk from '@components/gitalk/gitalk';

const Home: React.FC = () => {
  return (
    <Layout>
      <TopMenu
        title="rob-myers"
        label="Robert S. R. Myers"
      />
      <Gitalk />
    </Layout>  
  );
};

export default Home;
