import { useEffect } from "react";
import useStageStore from "store/stage.store";

const Stage: React.FC<Props> = ({ stageKey }) => {

  useEffect(() => {
    useStageStore.api.createStage(stageKey);
    return () => {
      useStageStore.api.removeStage(stageKey);
    };
  }, [stageKey]);

  return (
    <section>
      Stage
    </section>
  );
}

interface Props {
  stageKey: string;
}

export default Stage;
