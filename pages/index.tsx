import { useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import { useDispatch } from 'react-redux';
import withRedux from '@store/with-redux';
import { Thunk } from '@store/nav.duck';
import Demo1 from '@components/demo/demo-1';
import css from './index.scss';

const Home: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(Thunk.initializeNav({}));
    return () => void Thunk.destroyNav({});
  }, []);

  return (
    <div className={css.root}>
      <h1>Hello, world!</h1>
      <Demo1 />
    </div>  
  );
};

export default hot(withRedux(Home));
