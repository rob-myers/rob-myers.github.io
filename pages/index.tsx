import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
// import { useState } from 'react';
// import Link from 'next/link';
// import NavDom from '@components/nav-dom/nav-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { Act } from '@store/test.duck';

const Home: React.FC = () => {
  // const [count, setCount] = useState(0);
  // const count = useSelector(({ test }) => test.count);
  // const dispatch = useDispatch();

  return (
    <div>
      <h1>Hello, world</h1>
    </div>
  );
};

export default hot(withRedux(Home));
