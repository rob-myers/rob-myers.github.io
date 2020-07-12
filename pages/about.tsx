import Layout from '@components/layout/layout';
import TopMenu from '@components/top-menu/top-menu';
import css from './about.scss';

const About: React.FC = () => {
  return (
    <Layout>
      <TopMenu title="about" label="About" />

      <section className={css.personalInfo}>
        <div>Robert S. R. Myers</div>
        <a href="mailto:me.robmyers@gmail.com">me.robmyers@gmail.com</a>
        <a href="mailto:robmyers@gumtree.com">robmyers@gumtree.com</a>
        <a href="https://www.linkedin.com/in/robert-myers-4822ab18a/" target="_blank" rel="noopener noreferrer">Linkedin</a>
        <a href="https://dblp.org/pers/hd/m/Myers:Robert_S=_R=" target="_blank" rel="noopener noreferrer">Academic Papers</a>
      </section>
    </Layout>
  );
};

export default About;
