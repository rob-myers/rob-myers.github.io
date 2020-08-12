import RootLayout from '@components/root-layout/root-layout';
import Blog from '@components/blog/blog';

const Home: React.FC = () => {
  return (
    <RootLayout>
      <Blog/>
    </RootLayout>
  );
};

export default Home;
