import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, CanvasContext } from "react-three-fiber";
import { PerspectiveCamera } from "three";
import { getWindow } from "model/dom.model";
import useGeomStore from "store/geom.store";
import useStageStore, { StoredStage } from "store/stage.store";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import { Box } from './Meshes';
import { Lights } from "./Lights";
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

  const onCreatedCanvas = useCallback((ctxt: CanvasContext) => {
    initializeCanvasContext(ctxt);
    setCtxt(ctxt);
  }, []);

  return (
    <section className={styles.root}>
      {stage && loadedGltf && (
        <Canvas
          pixelRatio={pixelRatio.current}
          onCreated={onCreatedCanvas}
        >
          <CameraControls stageKey={stageKey} />
          <Grid />
          <Lights />

          <group>
            <Box />
          </group>
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
