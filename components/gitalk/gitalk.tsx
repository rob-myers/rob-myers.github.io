import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getWindow } from '@model/dom.model';
import { Thunk } from '@store/gitalk.duck';

const Gitalk: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const url = getWindow()?.location.href;
    if (url) {
      dispatch(Thunk.handleLogin({ url }));
    }
  }, []);

  return null;
};

export default Gitalk;
