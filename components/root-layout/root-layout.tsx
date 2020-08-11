import css from './root-layout.scss';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

const RootLayout: React.FC = ({ children }) => {
  const router = useRouter();

  return (
    <section className={css.root}>
      <Head>
        <title>Game AI Blog</title>
      </Head>
      <div className={css.header}>
        <h1 className={css.title}>
          <svg className={css.svgTitle} viewBox="0 -60 500 80">
            <text className={css.text}>
              be.have.your
            </text>
          </svg>
        </h1>
        <div className={css.links}>
          {router.pathname !== '/' && <Link href="/"><a>blog</a></Link>}
          {router.pathname !== '/meta' && <Link href="meta"><a>meta</a></Link>}
          <Link href="defs"><a>defs</a></Link>
        </div>
      </div>
      <div>
        {children}
      </div>
    </section>
  );
};

export default RootLayout;
