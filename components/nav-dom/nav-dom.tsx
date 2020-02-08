import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNavElemId, observeOpts } from './nav.model';
import { Act, Thunk } from '@store/nav.duck';

/**
 * This component uses its DOM descendents to create a navmesh.
 */
const NavDom: React.FC<Props> = ({ uid, children }) => {

  const rootId = getNavElemId(uid, 'root');
  const dispatch = useDispatch();
  const state = useSelector(({ nav: { dom } }) => dom[uid]);
  const rootDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state) dispatch(Act.registerNavDom(uid));

    // Compute navigation initially
    dispatch(Thunk.updateNavigable(uid));

    // Update navigation on dom change
    const observer = new MutationObserver(mutations => {
      console.log({ mutations });
      dispatch(Thunk.updateNavigable(uid));
    });
    observer.observe(rootDiv.current!, observeOpts);

    return () => {
      dispatch(Act.unregisterNavDom(uid));
      observer.disconnect();
    };
  }, []);

  return (
    <div id={rootId} ref={rootDiv}>
      {children}
    </div>
  );
};

interface Props {
  uid: string;
  showMesh?: boolean;
}

export default NavDom;
