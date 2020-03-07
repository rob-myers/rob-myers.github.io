import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import Level from '@components/level/level';

const Demo3Page: React.FC = () => {
  return (
    <Level width={500} height={500} />
  );
};

export default hot(withRedux(Demo3Page));
