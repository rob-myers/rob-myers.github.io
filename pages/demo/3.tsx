import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import Level from '@components/level/level';

const Demo3Page: React.FC = () => {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 50 }}>
        <Level width={500} height={500} />
      </div>
    </div>
  );
};

export default hot(withRedux(Demo3Page));
