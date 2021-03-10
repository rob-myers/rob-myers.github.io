import styles from 'styles/Stage.module.css';

const StageToolbar: React.FC<Props> = ({ stageKey }) => {
  return (
    <section className={styles.toolbar}>
      <span>
        @{stageKey}
      </span>
      <span className={styles.button}>
        camera
      </span>
    </section>
  );
};

interface Props {
  stageKey: string;
}

export default StageToolbar;