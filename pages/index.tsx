import { hot } from 'react-hot-loader/root';
import Head from 'next/head';
import withRedux from '@store/with-redux';
import Link from 'next/link';
import css from './index.scss';

const links = [
  { label: 'NavDom (old)', pathname: '/demo', query: { id: 1 } },
  { label: 'Bash in browser', pathname: '/demo', query: { id: 2 } },
  { label: 'Level', pathname: '/demo', query: { id: 3 } },
];

const Home: React.FC = () => {
  return (
    <section className={css.root}>
      <Head>
        <title>rob-myers</title>
      </Head>
      <h1>Robert S. R. Myers</h1>
      <section className={css.links}>
        <Link href="about">
          <a>About</a>
        </Link>
        {
          links.map(({ query, label }, i) => (
            <div key={i}>
              <Link href="demo/[pid]" as={`demo/${query.id}`}>
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
