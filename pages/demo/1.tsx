import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import Demo1 from '@components/demo/demo-1';

const Demo1Page: React.FC = () => {
  return (
    <Demo1/>
  );
};

export default hot(withRedux(Demo1Page));
