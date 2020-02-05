import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNavElemId } from './nav-util';
import Acts from '@store/nav.duck';
import { RootState } from '@store/reducer';

/**
 * This component uses its DOM descendents to create a navmesh.
 */
const NavDom: React.FC<Props> = ({ ctxtKey }) => {
  const rootId = getNavElemId(ctxtKey, 'root');
  const dispatch = useDispatch();
  const state = useSelector(({ nav: { dom: navdom } }: RootState) => navdom);

  useEffect(() => {
    if (!state) {
      dispatch(Acts.registerNavDom(ctxtKey));
    }

    // // Recompute walkable on dom change within div.
    // const observer = new MutationObserver(_mutations => {
    //   // console.log({ mutations });
    //   dispatch(tdUpdateWalkableThunk({ ctxtKey: uid }));
    // });
    // observer.observe(rootDivRef.current!, {
    //   attributes: true,
    //   childList: true,
    //   subtree: true
    // });

    // setInitialized(true);
    // dispatch(tdUpdateWalkableThunk({ ctxtKey: uid }));
    // return () => {
    //   dispatch(tdRemoveCtxt.act({ uid }));
    //   // window.removeEventListener("resize", onResize);
    //   observer.disconnect();
    // };
  }, []);

  return (
    <div id={rootId}>
      NavDom
    </div>
  );
};

interface Props {
  ctxtKey: string;
  showMesh?: boolean;
}

export default NavDom;
