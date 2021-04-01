import React, { useCallback, useEffect, useRef, useState } from "react";
import { PerspectiveCamera } from "three";
import { Canvas, CanvasContext } from "react-three-fiber";
import { Subject } from "rxjs";

import { getWindow, getNormDevicePos } from "model/dom.model";
import { StageMeta } from "model/stage/stage.model";
import useGeomStore from "store/geom.store";
import useStage from "store/stage.store";

import StageToolbar from "./StageToolbar";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import Axes from "./Axes";
import Lights from "./Lights";
import Brush, { PointerMsg } from "./Brush";
import Navigable from "./Navigable";
import Walls from "./Walls";
import styles from "styles/Stage.module.css";

const Stage: React.FC<Props> = ({ stageKey }) => {
  const rehydrated = useStage(({ rehydrated }) => rehydrated);
  const stage = useStage(({ stage }) => stage[stageKey]??null);

  const loadedGltf = useGeomStore(({ loadedGltf }) => loadedGltf);
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);

  useEffect(() => {
    rehydrated && useStage.api.ensureStage(stageKey);
    stage && ctxt?.gl && useStage.api.updateInternal(stageKey, { scene: ctxt.scene });
  }, [stageKey, rehydrated, ctxt?.gl]);

  const onCreatedCanvas = useCallback((ctxt: CanvasContext) => {
    initializeCanvasContext(ctxt, stage);
    setCtxt(ctxt);
  }, [stage]);

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

  const focusOnMouseOver = useCallback((e: React.MouseEvent<HTMLElement>) =>
    stage.internal.camEnabled && e.currentTarget.focus()
  , [stage]);

  return (
    <section
      className={styles.root}
      tabIndex={0}
      onKeyDown={onKey}
      onKeyUp={onKey}
      onMouseOver={focusOnMouseOver}
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

          <Navigable stage={stage} />
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

function initializeCanvasContext(
  ctxt: CanvasContext,
  stage: StageMeta,
) {
  const camera = ctxt.camera as PerspectiveCamera;
  camera.position.copy(stage.internal.initCamPos);
  camera.setFocalLength(35);
  // ctxt.gl.shadowMap.enabled = true;
  // ctxt.gl.shadowMap.autoUpdate = false;
  // ctxt.gl.shadowMap.type = PCFSoftShadowMap;
}

export default Stage;
