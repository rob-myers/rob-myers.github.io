import RootLayout from '@components/ui/root-layout';
import Blog from '@components/blog/blog';

const Home: React.FC = () => {
  return (
    <RootLayout>
      <Blog/>
    </RootLayout>
  );
};

export default Home;
