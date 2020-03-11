import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import Level from '@components/level/level';

const Demo3Page: React.FC = () => {
  return (
    <div style={{ width: 60 * 16, height: 60 * 8 }}>
      <Level uid="level-1" />
    </div>
  );
};

export default hot(withRedux(Demo3Page));
