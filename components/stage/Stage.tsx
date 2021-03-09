import { getWindow } from "model/dom.model";
import { useEffect, useRef, useState } from "react";
import { Canvas, CanvasContext } from "react-three-fiber";
import { PCFSoftShadowMap, PerspectiveCamera } from "three";
import useGeomStore from "store/geom.store";
import useStageStore, { StoredStage } from "store/stage.store";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
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
      {stage && loadedGltf && (
        <Canvas
          pixelRatio={pixelRatio.current}
          onCreated={(ct) => {
            const camera = ct.camera as PerspectiveCamera;
            camera.position.set(0, 0, 10);
            camera.setFocalLength(35);

            ct.gl.shadowMap.enabled = true;
            ct.gl.shadowMap.autoUpdate = false;
            ct.gl.shadowMap.type = PCFSoftShadowMap;
            setCtxt(ct);
          }}
        >
          <CameraControls stageKey={stageKey} />

          <Grid />

        </Canvas>
      )}
    </section>
  );
}

interface Props {
  stageKey: string;
}

export default Stage;
