import { getNavElemId } from '@model/nav.model';
import css from './nav-dom.scss';
import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Thunk, Act } from '@store/nav.duck';

const NavSpawn: React.FC<Props> = ({ uid }) => {
  const [navDomUid, setNavDomUid] = useState<null | string>(null);
  const dispatch = useDispatch();
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const el = elRef.current as HTMLDivElement;
      const { navDomUid } = dispatch(Thunk.tryRegisterSpawn({ uid, el }));
      setNavDomUid(navDomUid);
    });
    return () => {
      window.clearTimeout(timeoutId);
      navDomUid && dispatch(Act.unregisterNavSpawn(uid, navDomUid));
    };
  }, []);

  return (
    <div
      ref={elRef}
      id={navDomUid
        ? getNavElemId({ key: 'spawn', uid, domUid: navDomUid  })
        : undefined
      }
      className={css.navSpawn}
    />
  );
};

interface Props {
  uid: string;
}

export default NavSpawn;
