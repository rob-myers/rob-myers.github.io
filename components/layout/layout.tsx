import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Thunk as GoldenLayoutThunk } from '@store/layout.duck';
import css from './layout.scss';

/**
 * Layout wrapper for all pages except dev environment.
 */
const Layout: React.FC = ({ children }) => {
  
  const dispatch = useDispatch();
  useEffect(() => {
    /**
     * Save development environment layout state. We already persist
     * to local storage, but we must save directly when switch pages.
     */
    dispatch(GoldenLayoutThunk.saveCurrentLayout({}));
  }, []);

  return (
    <section className={css.root}>
      {children}
    </section>
  );
};

export default Layout;
