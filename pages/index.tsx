import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
// import Demo1 from '@components/demo/demo-1';
import Demo2 from '@components/demo/demo-2';
import css from './index.scss';

const Home: React.FC = () => {
  return (
    <section className={css.root}>
      {/* <h2>Hello, world!</h2> */}
      {/* <Demo1 /> */}
      <Demo2 />
    </section>  
  );
};

export default hot(withRedux(Home));
