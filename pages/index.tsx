import { hot } from 'react-hot-loader/root';
// import { useState } from 'react';
import Link from 'next/link';
import NavDom from '@components/nav-dom/nav-dom';
import withRedux from '@store/with-redux';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/reducer';
import Act from '@store/test.duck';

const Home: React.FC = () => {
  // const [count, setCount] = useState(0);
  const count = useSelector(({ test }: RootState) => test.count);
  const dispatch = useDispatch();

  return (
    <div>
      <h1>Hello, world</h1>
      <div>
        <Link href="/about">
          <a>About</a>
        </Link>
      </div>
      <div>
        <NavDom ctxtKey="foo"/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: 100 }}>
        <div>{count}</div>
        {/* <button onClick={() => setCount(count + 1)}>+1</button> */}
        <button onClick={() => dispatch(Act.testDecrement())}>-1</button>
        <button onClick={() => dispatch(Act.testIncrement())}>+1</button>
      </div>
    </div>
  );
};

export default hot(withRedux(Home));
