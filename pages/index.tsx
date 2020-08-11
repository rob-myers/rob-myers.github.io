import RootLayout from '@components/root-layout/root-layout';
import BlogRoot from '@components/blog/blog-root';

const Home: React.FC = () => {
  return (
    <RootLayout>
      <BlogRoot/>
    </RootLayout>
  );
};

export default Home;
