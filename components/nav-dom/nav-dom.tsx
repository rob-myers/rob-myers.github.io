import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNavElemId } from './nav.model';
import { Act, Thunk } from '@store/nav.duck';
import { RootState } from '@store/reducer';

/**
 * This component uses its DOM descendents to create a navmesh.
 */
const NavDom: React.FC<Props> = ({ uid, children }) => {

  const rootId = getNavElemId(uid, 'root');
  const dispatch = useDispatch();
  const state = useSelector(({ nav: { dom } }: RootState) => dom[uid]);
  const rootDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state) {
      dispatch(Act.registerNavDom(uid));
    }

    // Recompute navigable on dom change.
    const observer = new MutationObserver(mutations => {
      console.log({ mutations });
      dispatch(Thunk.updateNavigable(uid));
    });
    observer.observe(rootDiv.current!, {
      attributes: true,
      childList: true,
      subtree: true
    });

    dispatch(Thunk.updateNavigable(uid));
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
