import Head from 'next/head';
import Link from 'next/link';
import css from './top-menu.scss';
import classNames from 'classnames';

const TopMenu: React.FC<Props> = ({
  title,
  label,
  disableLinks = false,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <h1 className={css.title}>
        {label}
      </h1>
      <section className={classNames(css.links, {
        [css.disabled]: disableLinks,
      })}>
        <Link  href="/"><a>Home</a></Link>
        <Link href="about"><a>About</a></Link>
        <Link href="test"><a>Test</a></Link>
      </section>
    </>
  );
};

interface Props {
  title: string;
  label: string;
  disableLinks?: boolean;
}

export default TopMenu;
