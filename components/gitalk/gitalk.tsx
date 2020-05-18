import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Thunk } from '@store/gitalk.duck';
import { getWindow } from '@model/dom.model';

const Gitalk: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const url = getWindow()?.location.href;
    url && dispatch(Thunk.handleLogin({ url }));
  }, []);

  return null;
};

export default Gitalk;
