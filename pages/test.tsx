// import { useState } from 'react';
import Link from 'next/link';
import withRedux from '@store/with-redux';
import { useDispatch, useSelector } from 'react-redux';
import { Act } from '@store/test.duck';

import css from './index.scss';

const Test: React.FC = () => {
  // const [count, setCount] = useState(0);
  const count = useSelector(({ test }) => test.count);
  const dispatch = useDispatch();

  return (
    <div className={css.root}>
      <h1>Welcome to the Test Page</h1>
      <div>
        <Link href="/about">
          <a>About</a>
        </Link>
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

export default withRedux(Test);
