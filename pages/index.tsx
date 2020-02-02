import Link from 'next/link';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Hello, world!</h1>
      <div>
        <Link href="/about">
          <a>About</a>
        </Link>
      </div>
    </div>
  );
};

export default Home;
