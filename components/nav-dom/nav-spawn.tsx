import css from './nav-dom.scss';
import { useRef } from 'react';
import shortid from 'shortid';

const NavSpawn: React.FC<Props> = ({ uid }) => {
  const genUid = useRef(() => shortid());
  const id = `${uid}_${genUid}`;

  return (
    <div
      id={id}
      className={`navigable nav-spawn ${css.navSpawn}`}
    />
  );
};

interface Props {
  uid: string;
}

export default NavSpawn;
