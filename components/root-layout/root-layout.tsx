import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import css from './root-layout.scss';

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
          <Link href="/">
            <a className={classNames({ [css.enabled]: router.pathname === '/' })}>blog</a>
          </Link>
          <Link href="/meta">
            <a className={classNames({ [css.enabled]: router.pathname === '/meta' })}>meta</a>
          </Link>
          <Link href="/defs">
            <a className={classNames({ [css.enabled]: router.pathname === '/defs' })}>defs</a>
          </Link>
        </div>
      </div>
      <div>
        {children}
      </div>
    </section>
  );
};

export default RootLayout;
