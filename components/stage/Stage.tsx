import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { PCFSoftShadowMap, PerspectiveCamera } from "three";
import { Canvas, CanvasContext } from "react-three-fiber";
import { Subject } from "rxjs";

import { getWindow, getNormDevicePos } from "model/dom.model";
import { StageMeta } from "model/stage/stage.model";
import useStage from "store/stage.store";

import StageToolbar from "./StageToolbar";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import Axes from "./Axes";
import Lights from "./Lights";
import Brush, { PointerMsg } from "./Brush";
import Navigable from "./Navigable";
import Walls from "./Walls";

const Stage: React.FC<Props> = ({ stageKey }) => {
  const rehydrated = useStage(({ rehydrated }) => rehydrated);
  const stage = useStage(({ stage }) => stage[stageKey]??null);

  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);

  useEffect(() => {
    if (rehydrated) useStage.api.ensureStage(stageKey);
    if (ctxt?.gl && !stage.internal.scene) {
      useStage.api.updateInternal(stageKey, { scene: ctxt.scene });
      setTimeout(() => useStage.api.updateNavigable(stageKey));
    }
  }, [stageKey, rehydrated, ctxt?.gl]);

  useEffect(() => {
    ctxt?.gl && (ctxt.gl.shadowMap.needsUpdate = true);
  }, [stage]);

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
    stage?.opts.panZoom && e.currentTarget.focus()
  , [stage]);

  return (
    <Root
      background={stage?.opts.background}
      tabIndex={0}
      onKeyDown={onKey}
      onKeyUp={onKey}
      onMouseOver={focusOnMouseOver}
    >
      <StageToolbar stage={stage} />

      {stage && (
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
          <Lights enabled={stage.opts.lights} />

          <CameraControls stage={stage} />
          {stage.internal.controls && (
            <Brush stage={stage} wire={ptrWire} />
          )}


          <Navigable stage={stage} />
          <Walls stage={stage} />
        </Canvas>
      )}

      <CentralDot />
    </Root>
  );
}

interface Props {
  stageKey: string;
}

const Root = styled.section<{ background: string }>`
  width: 100%;
  height: 100%;
  border: 1px solid #000;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  position: relative;
  ${({ background }) => css`
    background: ${background};
  `}
`;

const CentralDot = styled.div`
    position: absolute;
    background: #fff;
    border: 1px solid red;
    border-radius: 2px;
    top: calc(28px + (100% - 28px) * 0.5 - 2px);
    left: calc(50% - 2px);
    height: 4px;
    width: 4px;
    pointer-events: none;
`;

function initializeCanvasContext(
  ctxt: CanvasContext,
  stage: StageMeta,
) {
  const camera = ctxt.camera as PerspectiveCamera;
  camera.position.copy(stage.internal.initCamPos);
  camera.setFocalLength(35);
  ctxt.gl.shadowMap.enabled = true;
  ctxt.gl.shadowMap.autoUpdate = false;
  ctxt.gl.shadowMap.type = PCFSoftShadowMap;
  ctxt.gl.shadowMap.needsUpdate = true;
}

export default Stage;
