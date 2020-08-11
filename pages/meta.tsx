import RootLayout from '@components/root-layout/root-layout';
import css from './meta.scss';

const Meta: React.FC = () => {
  return (
    <RootLayout>
      <section className={css.personalInfo}>
        <div>Robert S. R. Myers</div>
        <a href="mailto:me.robmyers@gmail.com">me.robmyers@gmail.com</a>
        <a href="mailto:robmyers@gumtree.com">robmyers@gumtree.com</a>
        <a href="https://www.linkedin.com/in/robert-myers-4822ab18a/" target="_blank" rel="noopener noreferrer">Linkedin</a>
        <a href="https://dblp.org/pers/hd/m/Myers:Robert_S=_R=" target="_blank" rel="noopener noreferrer">Academic Papers</a>
      </section>
    </RootLayout>
  );
};

export default Meta;
