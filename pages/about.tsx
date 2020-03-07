import Head from 'next/head';
import css from './about.scss';

const About: React.FC = () => {
  return (
    <section className={css.root}>
      <Head>
        <title>About</title>
      </Head>
      <h1>About</h1>
      <section className={css.personalInfo}>
        <div>Robert S. R. Myers</div>
        <a href="mailto:me.robmyers@gmail.com">me.robmyers@gmail.com</a>
        <a href="mailto:robmyers@gumtree.com">robmyers@gumtree.com</a>
        <a href="https://www.linkedin.com/in/robert-myers-4822ab18a/">Linkedin</a>
        <a href="https://dblp.org/pers/hd/m/Myers:Robert_S=_R=">Academic Papers</a>
      </section>
    </section>
  );
};

export default About;
