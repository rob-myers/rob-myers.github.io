import { hot } from 'react-hot-loader/root';
import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useDispatch } from 'react-redux';

import withRedux from '@store/with-redux';
import { Thunk } from '@store/global.duck';
import css from './index.scss';

const Home: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      await dispatch(Thunk.ensureSetup({}));
    })();
  }, []);

  return (
    <section className={css.root}>
      <Head><title>rob-myers</title></Head>
      <h1>Robert S. R. Myers</h1>

      <section className={css.links}>
        <Link href="about">
          <a>About</a>
        </Link>
        <Link href="test">
          <a>Test</a>
        </Link>
      </section>
    </section>  
  );
};

export default hot(withRedux(Home));
