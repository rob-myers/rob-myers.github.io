import { getNavElemId } from '@model/nav.model';
import css from './nav-dom.scss';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Thunk, Act } from '@store/nav.duck';

const NavSpawn: React.FC<Props> = ({ uid }) => {
  const elRef = useRef<HTMLDivElement>(null);
  const [id, setId] = useState<undefined | string>(undefined);
  const domUid = useRef<null | string>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // TODO listen for [NavDom] register instead
    const timeoutId = window.setTimeout(() => {
      const el = elRef.current as HTMLDivElement;
      const { navDomUid } = dispatch(Thunk.tryRegisterSpawn({ uid, el }));
      if (navDomUid) {
        domUid.current = navDomUid;
        setId(getNavElemId({ key: 'spawn', uid, domUid: navDomUid }));
      }
    });
    return () => {
      window.clearTimeout(timeoutId);
      domUid.current && dispatch(Act.unregisterNavSpawn(uid, domUid.current));
    };
  }, []);

  return (
    <div
      ref={elRef}
      id={id}
      className={`navigable ${css.navSpawn}`}
    />
  );
};

interface Props {
  uid: string;
}

export default NavSpawn;
