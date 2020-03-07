import { hot } from 'react-hot-loader/root';
import Head from 'next/head';
import withRedux from '@store/with-redux';
import Link from 'next/link';
import css from './index.scss';

const links = [
  { label: 'About', pathname: '/about', query: {} },
  { label: 'Demo 1', pathname: '/demo', query: { id: 1 } },
  { label: 'Demo 2', pathname: '/demo', query: { id: 2 } },
];

const Home: React.FC = () => {
  return (
    <section className={css.root}>
      <Head>
        <title>rob-myers</title>
      </Head>
      <section className={css.links}>
        {
          links.map(({ pathname, query, label }, i) => (
            <div key={i}>
              <Link href={{ pathname, query }}>
                <a>{ label }</a>
              </Link> 
            </div>
          ))
        }
      </section>
    </section>  
  );
};

export default hot(withRedux(Home));
