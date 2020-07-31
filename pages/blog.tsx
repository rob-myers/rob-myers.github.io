import TopMenu from '@components/top-menu/top-menu';
import Layout from '@components/layout/layout';
import BlogRoot from '@components/blog/blog-root';

const Test: React.FC = () => {
  return (
    <Layout>
      <TopMenu title="blog" label="Blog" />
      <BlogRoot/>
    </Layout>
  );
};

export default Test;
