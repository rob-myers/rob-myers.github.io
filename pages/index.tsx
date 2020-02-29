import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
// import Demo1 from '@components/demo/demo-1';
import Demo2 from '@components/demo/demo-2';
import css from './index.scss';

const Home: React.FC = () => {
  return (
    <div className={css.root}>
      <h1>Hello, world!</h1>
      {/* <Demo1 /> */}
      <Demo2 />
    </div>  
  );
};

export default hot(withRedux(Home));
