import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import css from './index.scss';
import Demo1 from '@components/demo/demo-1';

const Home: React.FC = () => {

  return (
    <div className={css.root}>
      <h1>Hello, world!</h1>
      <Demo1 />
    </div>  
  );
};

export default hot(withRedux(Home));


