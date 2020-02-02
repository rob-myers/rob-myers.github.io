import { hot } from 'react-hot-loader/root';
import Link from 'next/link';
import NavDom from '@components/nav-dom/nav-dom';
import { useState } from 'react';

const Home: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Hello, world</h1>
      <div>
        <Link href="/about">
          <a>About</a>
        </Link>
      </div>
      <div>
        <NavDom/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: 100 }}>
        <div>{count}</div>
        <button onClick={() => setCount(count + 1)}>+1</button>
      </div>
    </div>
  );
};

// export default Home;
export default hot(Home);
