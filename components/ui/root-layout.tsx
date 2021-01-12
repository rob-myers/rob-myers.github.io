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
        <title>
            the subatomic theory of finite machines
        </title>
      </Head>
      <div className={css.content}>
        <div className={css.header}>
          <div className={css.links}>
            <Link href="/" scroll={false}>
              <a className={classNames({ [css.enabled]: router.pathname === '/' })} title="goto blog">blog</a>
            </Link>
            <Link href="/defs " scroll={false}>
              <a className={classNames({ [css.enabled]: router.pathname === '/defs' })} title="view definitions">defs</a>
            </Link>
            <Link href="/meta" scroll={false}>
              <a className={classNames({ [css.enabled]: router.pathname === '/meta' })} title="about me">meta</a>
            </Link>
            <Link href="/demo" scroll={false}>
              <a className={classNames({ [css.enabled]: router.pathname === '/demo' })} title="view demos">demo</a>
            </Link>
          </div>
          <h1 className={css.title}>
              The
              <span className={css.subatomic}> subatomic </span>
              theory of finite machines
          </h1>
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
