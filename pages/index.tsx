import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Gitalk from '@components/gitalk/gitalk';
import css from './index.scss';

const DevEnv = dynamic(import('@components/dev-env/dev-env'), { ssr: false });

const Home: React.FC = () => {
  return (
    <section className={css.root}>
      <Head><title>rob-myers</title></Head>

      <h1>Robert S. R. Myers</h1>

      <section className={css.links}>
        <Link href="about"><a>About</a></Link>
        <Link href="test"><a>Test</a></Link>
      </section>

      <DevEnv />

      <Gitalk />
    </section>  
  );
};

export default Home;
