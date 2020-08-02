import Head from 'next/head';
import Link from 'next/link';
import classNames from 'classnames';
import css from './top-menu.scss';

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
        <Link href="/"><a>home</a></Link>
        <Link href="about"><a>about</a></Link>
        <Link href="blog"><a>blog</a></Link>
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
