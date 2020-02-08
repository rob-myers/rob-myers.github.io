import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import NavDom from '@components/nav-dom/nav-dom';
// import { useState } from 'react';
// import Link from 'next/link';
// import { useDispatch, useSelector } from 'react-redux';
// import { Act } from '@store/test.duck';

import css from './index.scss';
import { useDispatch } from 'react-redux';
import { Thunk } from '@store/nav.duck';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const dim = (width: number, height: number) =>
    ({ width, height, background: '#000' });

  if (module.hot) {
    module.hot.accept('./index.scss', function() {
      dispatch(Thunk.updateNavigable({ uid: 'demo' }));
    });
  }

  return (
    <div>
      <h1>Hello, world!</h1>
      <NavDom uid='demo'>
        <div className={css.containerTest}>
          <div className={css.test} style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
        </div>
        <div className={css.containerTest}>
          <div className={css.test} style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
        </div>
        <div className={css.containerTest}>
          <div className={css.test} style={dim(30,30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
          <div style={dim(30, 60)}/>
          <div style={dim(30, 30)}/>
          <div style={dim(30, 60)}/>
        </div>
        <div className={css.containerTest}>
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


