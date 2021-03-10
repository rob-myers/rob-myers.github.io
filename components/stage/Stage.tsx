import { useCallback, useEffect, useRef, useState } from "react";
import { PerspectiveCamera } from "three";
import { Canvas, CanvasContext } from "react-three-fiber";
import { Subject } from "rxjs";

import { getWindow, getNormDevicePos } from "model/dom.model";
import useGeomStore from "store/geom.store";
import useStageStore, { StoredStage } from "store/stage.store";

import StageToolbar from "./StageToolbar";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import Lights from "./Lights";
import SelectRect, { Wire } from "./SelectRect";
import Walls from "./Walls";
import styles from 'styles/Stage.module.css';

const Stage: React.FC<Props> = ({ stageKey }) => {
  const stage = useStageStore<StoredStage | null>(({ stage }) => stage[stageKey]??null);
  const loadedGltf = useGeomStore(({ loadedGltf }) => loadedGltf);
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);

  useEffect(() => {
    useStageStore.api.createStage(stageKey);
    return () => useStageStore.api.removeStage(stageKey);
  }, [stageKey]);

  useEffect(() => {
    stage && ctxt?.gl && useStageStore.api.updateStage(stageKey, { scene: ctxt.scene });
  }, [stage?.key, ctxt?.gl]);

  const onCreatedCanvas = useCallback((ctxt: CanvasContext) => {
    initializeCanvasContext(ctxt);
    setCtxt(ctxt);
  }, []);

  const selectWire = useRef<Wire>(new Subject);
  const onPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    selectWire.current.next({ key: e.type as any, ndCoords: getNormDevicePos(e) });
  }, [stage]);

  return (
    <section className={styles.root}>
      <StageToolbar stage={stage} />

      {stage && loadedGltf && (
        <Canvas
          pixelRatio={pixelRatio.current}
          onCreated={onCreatedCanvas}
          onPointerDown={onPointer}
          onPointerMove={onPointer}
          onPointerUp={onPointer}
          onPointerLeave={onPointer}
        >
          <CameraControls stageKey={stageKey} enabled={stage.camEnabled} />
          <Grid />
          <Lights />
          <SelectRect
            stage={stage}
            wire={selectWire.current}
          />

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
