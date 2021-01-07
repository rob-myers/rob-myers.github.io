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
        <title>subatomic theory of finite machines</title>
      </Head>
      <div className={css.content}>
        <div className={css.header}>
          <h1 className={css.title}>
              <div className={css.svgTitle}>
                the
                <span className={css.subatomic}> subatomic </span>
                theory of finite machines
              </div>
          </h1>
          <div className={css.links}>
            <Link href="/" scroll={false}>
              <a className={classNames({ [css.enabled]: router.pathname === '/' })}>blog</a>
            </Link>
            <Link href="/defs " scroll={false}>
              <a className={classNames({ [css.enabled]: router.pathname === '/defs' })}>defs</a>
            </Link>
            <Link href="/meta" scroll={false}>
              <a className={classNames({ [css.enabled]: router.pathname === '/meta' })}>meta</a>
            </Link>
            <Link href="/demo" scroll={false}>
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
