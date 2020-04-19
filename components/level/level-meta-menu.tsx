import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import css from './level.scss';
import { LevelMetaGroupUi } from '@model/level/level-meta.model';
import { Thunk } from '@store/level.duck';

const LevelMetaMenu: React.FC<Props> = ({ levelUid }) => {
  const [openMetas, setOpenMetas] = useState<LevelMetaGroupUi[]>([]);
  const metaGroupUi = useSelector(({ level: { instance } }) => instance[levelUid].metaGroupUi);
  const dispatch = useDispatch();
  const closeMenu = () => dispatch(Thunk.closeAllMetas({levelUid}));

  useEffect(() => {
    const groups = Object.values(metaGroupUi);
    const openMetas = groups.filter(({ open }) => open);
    setOpenMetas(openMetas);
  }, [metaGroupUi]);

  return (
    <div className={css.metaMenuContainer}>
      <div
        className={classNames(css.metaMenu)}
        style={{ height: openMetas.length * 20 }}
      >
        <section className={css.mainMenu}>
        </section>
        <section className={css.rightMenu}>
          <button onClick={closeMenu}>
          close
          </button>
        </section>
      </div>
    </div>
  );
};

interface Props {
  levelUid: string;
}

export default LevelMetaMenu;
