import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import css from './level.scss';

const LevelMetaMenu: React.FC<Props> = ({ levelUid }) => {
  const [open, setOpen] = useState(false);
  const metaGroupUi = useSelector(({ level: { instance } }) => instance[levelUid].metaGroupUi);
  
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const groups = Object.values(metaGroupUi);
    const opens = groups.filter(({ open }) => open);
    opens.length && setOpen(true);
  }, [metaGroupUi]);

  return (
    <section className={classNames(css.metaMenu, open ? css.open : css.closed)}>
      <section className={css.mainMenu}>
      </section>
      <section className={css.rightMenu}>
        <button onClick={closeMenu}>
          close
        </button>
      </section>
    </section>
  );
};

interface Props {
  levelUid: string;
}

export default LevelMetaMenu;
