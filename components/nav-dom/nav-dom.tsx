import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNavElemId } from '@model/nav.model';
import { Act, Thunk } from '@store/nav.duck';
import NavDomBackground from './nav-dom-bg';
import css from './nav-dom.scss';

const NavDom: React.FC<Props> = ({
  uid,
  children,
  contentStyle,
  contentClass,
  navOutset,
  debug,
}) => {
  const dispatch = useDispatch();
  const state = useSelector(({ nav: { dom } }) => dom[uid]);
  const failedRef = useRef(false);

  useEffect(() => {// NOTE editing this hook remounts it
    if (dispatch(Thunk.domUidExists({ uid }))) {
      failedRef.current = true;
      console.error(`Duplicate NavDom uid "${uid}" detected`);
      return;
    }

    dispatch(Thunk.ensureGlobalSetup({}));
    dispatch(Act.registerNavDom(uid));
    // setTimeout handles unexplained initial remount
    const updateId = window.setTimeout(() => dispatch(Thunk.updateNavigable({ uid })));

    // detect hot reloading
    const hotHandler = (status: string) => (status === 'idle')
      && dispatch(Act.updateDomMeta(uid, { justHmr: true }));
    module.hot && module.hot.addStatusHandler(hotHandler);

    return () => {
      window.clearTimeout(updateId);
      if (!failedRef.current) {
        dispatch(Act.unregisterNavDom(uid));
        module.hot && module.hot.removeStatusHandler(hotHandler);
      }
    };
  }, []);

  useEffect(() => {
    state && dispatch(Act.updateNavDom(uid, { navOutset }));
  }, [navOutset]);

  useEffect(() => {
    state && dispatch(Act.updateDomMeta(uid, { debug }));
  }, [debug]);

  useEffect(() => {// Rebuild nav on 1st render after hot reload
    if (module.hot && dispatch(Thunk.getDomMeta({ uid })).justHmr) {
      dispatch(Thunk.updateNavigable({ uid }));
      dispatch(Act.updateDomMeta(uid, { justHmr: false }));
    }
  });

  if (typeof window === 'undefined') return null; // No SSR

  return (
    <div
      className={css.root}
      onClick={() => {
        console.log('click');
      }}
    >
      <NavDomBackground uid={uid} />
      <div
        id={getNavElemId({ key: 'content', domUid: uid })}
        className={[css.contentRoot, contentClass].join(' ')}
        style={{ ...contentStyle }}
      >
        {children}
      </div>
    </div>
  );
};

interface Props {
  uid: string;
  showMesh?: boolean;
  navOutset?: number;
  contentStyle?: React.CSSProperties;
  contentClass?: string;
  debug?: boolean;
}

export default NavDom;
