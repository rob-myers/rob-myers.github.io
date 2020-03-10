import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import Level from '@components/level/level';

const Demo3Page: React.FC = () => {
  return (
    <div style={{
      width: 600,
      height: 600,
      overflow: 'auto'
    }}>
      <Level uid="level-1" width={2000} height={2000} />
    </div>
  );
};

export default hot(withRedux(Demo3Page));
