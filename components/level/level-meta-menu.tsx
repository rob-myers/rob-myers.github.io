import css from './level.scss';

const LevelMetaMenu: React.FC<Props> = () => {
  return (
    <section className={css.metaMenu}>
      <section className={css.mainMenu}>
      </section>
      <section className={css.rightMenu}>
        <button>
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
