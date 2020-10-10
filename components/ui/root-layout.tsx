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
        <title>game ai blog</title>
      </Head>
      <div className={css.content}>
        <div className={css.header}>
          <h1 className={css.title}>
            <svg
              className={css.svgTitle}
              viewBox="0 -60 420 80"
              preserveAspectRatio="xMinYMin"
            >
              <text className={css.text}>
                behave yr
              </text>
            </svg>
          </h1>
          <div className={css.links}>
            <Link href="/">
              <a className={classNames({ [css.enabled]: router.pathname === '/' })}>blog</a>
            </Link>
            <Link href="/defs">
              <a className={classNames({ [css.enabled]: router.pathname === '/defs' })}>defs</a>
            </Link>
            <Link href="/meta">
              <a className={classNames({ [css.enabled]: router.pathname === '/meta' })}>meta</a>
            </Link>
            <Link href="/demo">
              <a className={classNames({ [css.enabled]: router.pathname === '/demo' })}>demo</a>
            </Link>
          </div>
        </div>
        <div className={css.body}>
          {children}
        </div>
      </div>
      <div className={css.emptyFooter} />
    </section>
  );
};

export default RootLayout;
