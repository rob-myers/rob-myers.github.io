import { PCFSoftShadowMap, PerspectiveCamera } from "three";
import { Subject } from "rxjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Canvas, CanvasContext } from "react-three-fiber";
import { useBeforeunload } from "react-beforeunload";

import { getWindow, getNormDevicePos } from "model/dom.model";
import useStage from "store/stage.store";

import StageToolbar from "./StageToolbar";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import Axes from "./Axes";
import Lights from "./Lights";
import Brush, { PointerMsg } from "./Brush";
import Navigable from "./Navigable";
import Walls from "./Walls";
import Meshes from "./Meshes";

const Stage: React.FC<Props> = ({ stageKey }) => {
  // console.log('Stage')
  const rehydrated = useStage(({ rehydrated }) => rehydrated);
  const stage = useStage(({ stage }) => stage[stageKey]??null);
  const pixelRatio = useRef(getWindow()?.devicePixelRatio);
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);

  const persistOnUnload = useCallback(() =>
    stage?.opts.autoPersist && useStage.api.persist(stageKey),
    [stage?.opts.autoPersist],
  );
  useBeforeunload(persistOnUnload);

  const onCreatedCanvas = useCallback((ctxt: CanvasContext) => {
    // Most recent initial camera position is persisted one
    const camera = ctxt.camera as PerspectiveCamera;
    const { initCameraPos } = useStage.api.getPersist(stageKey).opts;
    camera.position.set(...initCameraPos);

    camera.setFocalLength(35);
    ctxt.gl.shadowMap.enabled = true;
    ctxt.gl.shadowMap.autoUpdate = false;
    ctxt.gl.shadowMap.type = PCFSoftShadowMap;
    ctxt.gl.shadowMap.needsUpdate = true;

    // Currently, updateNavigable will also update stage.internal
    stage.internal.scene = ctxt.scene;
    ctxt.scene.add(stage.brush.selectedMeshes);
    setTimeout(() => useStage.api.updateNavigable(stageKey));
    setCtxt(ctxt);
  }, [stage?.internal]);

  useEffect(() => {
    if (rehydrated) {
      useStage.api.ensureStage(stageKey);
    }
    // NOTE `ctxt?.gl` instead of `ctxt` for hotreloads on edit stage.store
    if (ctxt?.gl && stage && !stage.opts.enabled) {
      // Detected stage disable
      ctxt.gl.render(ctxt.scene, ctxt.camera);
      stage.extra.canvasPreview = ctxt.gl.domElement.toDataURL();
      stage.internal.scene = undefined;
      useStage.api.persist(stageKey);
      setCtxt(null);
    }
  }, [rehydrated, stage?.opts.enabled]);

  useEffect(() => {
    if (ctxt?.gl) {
      ctxt.gl.shadowMap.needsUpdate = true;
    }
  }, [stage?.polygon, stage?.opts]);

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
    stage?.opts.enabled && stage.opts.panZoom && 
      e.currentTarget.focus(), [stage?.opts]);

  return (
    <Root
      background={stage?.opts.enabled && ctxt ? stage.opts.background : '#aaa'}
      tabIndex={0}
      onKeyDown={onKey}
      onKeyUp={onKey}
      onMouseOver={focusOnMouseOver}
    >
      <StageToolbar stage={stage} />

      {stage && (stage?.opts.enabled || ctxt) && (

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
          <CameraControls
            enabled={stage.opts.panZoom}
            internal={stage.internal}
          />
          <Brush
            brush={stage.brush}
            wire={ptrWire}
          />

          <Lights enabled={stage.opts.lights} />
          <Navigable
            bounds={stage.internal.bounds}
            polygon={stage.polygon}
            lightsEnabled={stage.opts.lights}
          />
          <Walls
            opts={stage.opts}
            polygon={stage.polygon}
            walls={stage.walls}
          />
          <Meshes mesh={stage.mesh} />

        </Canvas>

      ) || stage?.extra.canvasPreview && (

        <Placeholder
          src={stage.extra.canvasPreview}
          draggable={false}
        />

      )}
    </Root>
  );
}

interface Props {
  /** Assumed constant */
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

const Placeholder = styled.img<{}>`
  margin: auto;
  overflow: hidden;
  max-width: 100%;
  max-height: 100%;
`;

export default Stage;
