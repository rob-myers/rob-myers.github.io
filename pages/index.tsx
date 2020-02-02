import Link from 'next/link';
import NavDom from '@components/nav-dom/nav-dom';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Hello, world!</h1>
      <div>
        <Link href="/about">
          <a>About</a>
        </Link>
      </div>
      <div>
        <NavDom/>
      </div>
    </div>
  );
};

export default Home;
