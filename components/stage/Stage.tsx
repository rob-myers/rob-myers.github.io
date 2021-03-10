import { useCallback, useEffect, useRef, useState } from "react";
import { PerspectiveCamera } from "three";
import { Canvas, CanvasContext } from "react-three-fiber";
import { getWindow } from "model/dom.model";
import useGeomStore from "store/geom.store";
import useStageStore, { StoredStage } from "store/stage.store";

import StageToolbar from "./StageToolbar";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import Lights from "./Lights";
import Walls from "./Walls";
import styles from 'styles/Stage.module.css';

const Stage: React.FC<Props> = ({ stageKey }) => {
  const stage = useStageStore<StoredStage | null>(({ stage }) => stage[stageKey]??null);
  const loadedGltf = useGeomStore(({ loadedGltf }) => loadedGltf);
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);

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

  const onCreatedCanvas = useCallback((ctxt: CanvasContext) => {
    initializeCanvasContext(ctxt);
    setCtxt(ctxt);
  }, []);

  return (
    <section className={styles.root}>
      <StageToolbar stage={stage} />

      {stage && loadedGltf && (
        <Canvas
          pixelRatio={pixelRatio.current}
          onCreated={onCreatedCanvas}
        >
          <CameraControls stageKey={stageKey} enabled={stage.camEnabled} />
          <Grid />
          <Lights />

          <Walls wallPolys={stage.wallPolys} />
        </Canvas>
      )}
    </section>
  );
}

interface Props {
  stageKey: string;
}

function initializeCanvasContext(ctxt: CanvasContext) {
  const camera = ctxt.camera as PerspectiveCamera;
  camera.position.set(0, 0, 10);
  camera.setFocalLength(35);
  // ctxt.gl.shadowMap.enabled = true;
  // ctxt.gl.shadowMap.autoUpdate = false;
  // ctxt.gl.shadowMap.type = PCFSoftShadowMap;
}

export default Stage;
