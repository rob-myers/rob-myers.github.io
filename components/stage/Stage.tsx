import * as THREE from "three";
import { Subject } from "rxjs";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Canvas } from "@react-three/fiber";
import { ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events";
import { RootState as CanvasContext } from "@react-three/fiber/dist/declarations/src/core/store";

import { getWindow } from "model/dom.model";
import { StagePointerEvent, StageMeta } from "model/stage/stage.model";
import useStage from "store/stage.store";

import StageToolbar from "./StageToolbar";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import Axes from "./Axes";
import Selection from "./Selection";
import Cursor from "./Cursor";
import World from "./World";

const Stage: React.FC<Props> = ({ stage }) => {
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);

  const onCreatedCanvas = useCallback((ctxt: CanvasContext) => {
    // Most recent initial camera position is persisted one
    const camera = ctxt.camera as THREE.PerspectiveCamera;
    const { initCameraPos } = useStage.api.getPersist(stage.key).extra;
    camera.position.set(...initCameraPos);
    
    camera.setFocalLength(35);
    ctxt.gl.shadowMap.enabled = true;
    ctxt.gl.shadowMap.autoUpdate = false;
    ctxt.gl.shadowMap.type = THREE.PCFSoftShadowMap;
    ctxt.gl.shadowMap.needsUpdate = true;

    stage.internal.scene = ctxt.scene;
    useStage.api.rehydrateBot(stage.key);
    setCtxt(ctxt);
  }, [stage.internal]);

  const updateShadowMap = useCallback(
    () => ctxt?.gl && (ctxt.gl.shadowMap.needsUpdate = true), [ctxt]);

  useEffect(() => {
    // NOTE `ctxt?.gl` instead of `ctxt` for hotreloads on edit stage.store
    if (ctxt?.gl && !stage.opt.enabled) {// Detected stage disable
      ctxt.gl.render(ctxt.scene, ctxt.camera);
      stage.extra.canvasPreview = ctxt.gl.domElement.toDataURL();
      delete stage.internal.scene;
      useStage.api.persist(stage.key);
      setCtxt(null);
    }
  }, [stage.opt.enabled]);

  const ptrWire = useRef(new Subject<StagePointerEvent>()).current;
  const onPointer = useCallback((e: ThreeEvent<PointerEvent>) => {
    ptrWire.next({ key: e.type as any, point: e.point });
  }, []);
  /** Change mesh `onPointerOut` type from 'pointermove' to 'pointerleave' */
  const onPointerOut = useCallback((e: ThreeEvent<PointerEvent>) =>
    ptrWire.next({ key: 'pointerleave', point: e.point }), []);

  const keyWire = stage.internal.keyEvents;
  const onKey = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    keyWire?.next({
      key: e.key,
      type: e.type as any,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
    });
  }, [keyWire]);

  const focusOnMouseOver = useCallback((e: React.MouseEvent<HTMLElement>) =>
    stage.opt.enabled && stage.opt.panZoom && e.currentTarget.focus(),
    [stage.opt],
  );

  const Base = useMemo(() => <>
    <mesh
      onPointerDown={onPointer}
      onPointerMove={onPointer}
      onPointerUp={onPointer}
      onPointerOut={onPointerOut}
      visible={false}
      matrixAutoUpdate={false}
    >
      <planeGeometry args={[100, 100]} />
    </mesh>
    <Grid />
    <Axes />
    <Cursor
      internal={stage.internal}
      ptrWire={ptrWire}
    />
  </>, []);

  const CamControls = useMemo(() =>
    <CameraControls
      internal={stage.internal}
      enabled={stage.opt.panZoom}
    />
  , [stage.opt.panZoom]);

  const Sel = useMemo(() =>
    <Selection
      sel={stage.sel}
      ptrWire={ptrWire}
    />
  , [stage.sel]);

  return (
    <Root
      background="#000"
      tabIndex={0}
      onKeyDown={onKey}
      onKeyUp={onKey}
      onMouseOver={focusOnMouseOver}
    >
      <StageToolbar
        stageKey={stage.key}
        opts={stage.opt}
        selection={stage.sel}
      />

      {(stage.opt.enabled || ctxt) && (

        <CanvasRoot
          dpr={getWindow()!.devicePixelRatio}
          onCreated={onCreatedCanvas}
        >
          {Base}
          {CamControls}
          {Sel}

          <World
            bot={stage.bot}
            light={stage.light}
            opt={stage.opt}
            poly={stage.poly}
            updateShadowMap={updateShadowMap}
          />

        </CanvasRoot>

      ) || stage?.extra.canvasPreview && (

        <Placeholder>
          <PlaceholderImage
            src={stage.extra.canvasPreview}
            draggable={false}
          />
        </Placeholder>

      )}
    </Root>
  );
}

interface Props {
  stage: StageMeta;
}

const Root = styled.section<{ background: string }>`
  width: 100%;
  height: 100%;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  position: relative;
  ${({ background }) => css`
    background: ${background};
  `}
`;

const CanvasRoot = styled(Canvas)`
  background: #000;
`;

const Placeholder = styled.div<{}>`
  width: 100%;
  overflow: hidden;
  display: flex;
  height: inherit;
  background: #111;
`;

const PlaceholderImage = styled.img<{}>`
  margin: auto;
  max-width: 100%;
  max-height: 100%;
`;

export default Stage;
