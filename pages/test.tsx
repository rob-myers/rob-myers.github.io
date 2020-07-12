import TopMenu from '@components/top-menu/top-menu';
import Layout from '@components/layout/layout';
import Blog from '@components/blog/blog';

const Test: React.FC = () => {
  return (
    <Layout>
      <TopMenu title="test" label="The Test Page" />
      <Blog/>
    </Layout>
  );
};

export default Test;
