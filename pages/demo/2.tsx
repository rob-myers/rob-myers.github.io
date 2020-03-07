import { hot } from 'react-hot-loader/root';
import withRedux from '@store/with-redux';
import { Session } from '@components/xterm/session';

const Demo2Page: React.FC = () => {
  return (
    <div>
      <Session uid="demo-2" userKey="user" />
    </div>
  );
};

export default hot(withRedux(Demo2Page));
