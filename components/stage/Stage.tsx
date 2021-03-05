import { getWindow } from "model/dom.model";
import { useEffect, useRef, useState } from "react";
import { CanvasContext } from "react-three-fiber";
import useGeomStore from "store/geom.store";
import useStageStore, { StoredStage } from "store/stage.store";
import styles from 'styles/Stage.module.css';

const Stage: React.FC<Props> = ({ stageKey }) => {
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);
  const loadedGltf = useGeomStore(({ loadedGltf }) => loadedGltf);
  const stage = useStageStore<StoredStage | null>(({ stage }) => stage[stageKey]??null);

  useEffect(() => {
    useStageStore.api.createStage(stageKey);
    return () => {
      useStageStore.api.removeStage(stageKey);
    };
  }, [stageKey]);

  useEffect(() => {
    if (stage && ctxt?.gl) {
      useStageStore.api.updateStage(stageKey, { scene: ctxt.scene });
    }

  }, [stage?.key, ctxt?.gl]);


  return (
    <section className={styles.root}>
      {stage && (
        null
      )}
    </section>
  );
}

interface Props {
  stageKey: string;
}

export default Stage;
