import css from './layout.scss';

/**
 * Layout wrapper for all pages except dev environment.
 */
const Layout: React.FC = ({ children }) => {
  return (
    <section className={css.root}>
      {children}
    </section>
  );
};

export default Layout;
