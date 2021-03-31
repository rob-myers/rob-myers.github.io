import React, { useCallback, useEffect, useRef, useState } from "react";
import { PerspectiveCamera } from "three";
import { Canvas, CanvasContext } from "react-three-fiber";
import { Subject } from "rxjs";

import { getWindow, getNormDevicePos } from "model/dom.model";
import { initCameraPos, StageMeta } from "model/stage/stage.model";
import useGeomStore from "store/geom.store";
import useStageStore from "store/stage.store";

import StageToolbar from "./StageToolbar";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import Axes from "./Axes";
import Lights from "./Lights";
import Brush, { PointerMsg } from "./Brush";
import Walls from "./Walls";
import styles from "styles/Stage.module.css";

const Stage: React.FC<Props> = ({ stageKey }) => {
  const stage = useStageStore<StageMeta | null>(({ stage }) => stage[stageKey]??null);
  const loadedGltf = useGeomStore(({ loadedGltf }) => loadedGltf);
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);

  useEffect(() => {
    useStageStore.api.ensureStage(stageKey);
    stage && ctxt?.gl && useStageStore.api.updateInternal(stageKey, { scene: ctxt.scene });
  }, [stageKey, ctxt?.gl]);

  const onCreatedCanvas = useCallback((ctxt: CanvasContext) => {
    initializeCanvasContext(ctxt);
    setCtxt(ctxt);
  }, []);

  const ptrWire = useRef(new Subject<PointerMsg>()).current;
  const onPointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    ptrWire.next({ key: e.type as any, ndCoords: getNormDevicePos(e) });
  }, []);
  
  const keyWire = stage?.internal.keyEvents;
  const onKey = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    keyWire?.next({
      key: e.key,
      type: e.type as any,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
    });
  }, [keyWire]);

  return (
    <section
      className={styles.root}
      tabIndex={0}
      onKeyDown={onKey}
      onKeyUp={onKey}
    >
      <StageToolbar stage={stage} />

      {stage && loadedGltf && (
        <Canvas
          pixelRatio={pixelRatio.current}
          onCreated={onCreatedCanvas}
          onPointerDownCapture={onPointer}
          onPointerMoveCapture={onPointer}
          onPointerUpCapture={onPointer}
          onPointerLeave={onPointer}
        >
          <Grid />
          <Axes />
          <Lights />

          <CameraControls stage={stage} />
          {stage.internal.controls && (
            <Brush stage={stage} wire={ptrWire} />
          )}

          <Walls stage={stage} />
        </Canvas>
      )}

      <div className={styles.centralDot} />
    </section>
  );
}

interface Props {
  stageKey: string;
}

function initializeCanvasContext(ctxt: CanvasContext) {
  const camera = ctxt.camera as PerspectiveCamera;
  camera.position.copy(initCameraPos);
  camera.setFocalLength(35);
  // ctxt.gl.shadowMap.enabled = true;
  // ctxt.gl.shadowMap.autoUpdate = false;
  // ctxt.gl.shadowMap.type = PCFSoftShadowMap;
}

export default Stage;
