import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';

const Demo1Page: React.FC = () => {
  return (
    <div>Demo 1</div>
  );
};

export default hot(withRedux(Demo1Page));
