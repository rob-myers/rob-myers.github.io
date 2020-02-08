import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import NavDom from '@components/nav-dom/nav-dom';
// import { useState } from 'react';
// import Link from 'next/link';
// import { useDispatch, useSelector } from 'react-redux';
// import { Act } from '@store/test.duck';

import css from './index.scss';

const Home: React.FC = () => {
  // const [count, setCount] = useState(0);
  // const count = useSelector(({ test }) => test.count);
  // const dispatch = useDispatch();
  const dim = (width: number, height: number) => ({ width, height, background: '#000' });

  return (
    <div>
      <h1>Hello, world!</h1>
      <NavDom uid='demo'>
        <div className={css['container-test']}>
          <div className={css.test} style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
        </div>
        <div className={css['container-test']}>
          <div className={css.test} style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
        </div>
        <div className={css['container-test']}>
          <div className={css.test} style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
        </div>
      </NavDom>
    </div>
  );
};

export default hot(withRedux(Home));
