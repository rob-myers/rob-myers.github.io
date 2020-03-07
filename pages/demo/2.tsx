import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import Demo2 from '@components/demo/demo-2';

const Demo2Page: React.FC = () => {
  return (
    <Demo2/>
  );
};

export default hot(withRedux(Demo2Page));
