import { useEffect } from "react";
import useStageStore from "store/stage.store";
import StageGrid from "./StageGrid";
import styles from 'styles/Stage.module.css';

const Stage: React.FC<Props> = ({ stageKey }) => {

  useEffect(() => {
    useStageStore.api.createStage(stageKey);
    return () => {
      useStageStore.api.removeStage(stageKey);
    };
  }, [stageKey]);

  const stage = useStageStore(({ stage }) =>
    stageKey in stage ? stage[stageKey] : null
  );
  const scale = `scale(${stage?.zoomFactor??1})`;

  return (
    <section className={styles.root}>
      {stage && (
        <section className={styles.viewport}>
          <svg>
            <g style={{ transform: scale }}>
              <StageGrid
                stageKey={stageKey}
                zoomFactor={stage.zoomFactor}
                offset={stage.offset} 
              />
            </g>
          </svg>
        </section>
      )}
    </section>
  );
}

interface Props {
  stageKey: string;
}

export default Stage;
