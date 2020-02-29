import { useDispatch } from 'react-redux';
import { Thunk } from '@store/xterm.duck';
import { useEffect } from 'react';

const Demo2: React.FC = () => {

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(Thunk.ensureGlobalSetup({}));
  }, []);

  return (
    <div>
      Foo
    </div>
  );
};

export default Demo2;
