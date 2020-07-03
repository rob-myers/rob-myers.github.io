import Layout from '@components/layout/layout';
import TopMenu from '@components/top-menu/top-menu';

const Home: React.FC = () => {
  return (
    <Layout>
      <TopMenu
        title="rob-myers"
        label="Robert S. R. Myers"
      />
    </Layout>  
  );
};

export default Home;
