import css from './layout.scss';

const Layout: React.FC = ({ children }) => {
  return (
    <section className={css.root}>
      {children}
    </section>
  );
};

export default Layout;
