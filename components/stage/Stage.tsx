import { PCFSoftShadowMap, PerspectiveCamera } from "three";
import { Subject } from "rxjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
    const camera = ctxt.camera as PerspectiveCamera;
    const { initCameraPos } = useStage.api.getPersist(stage.key).extra;
    camera.position.set(...initCameraPos);
    
    camera.setFocalLength(35);
    ctxt.gl.shadowMap.enabled = true;
    ctxt.gl.shadowMap.autoUpdate = false;
    ctxt.gl.shadowMap.type = PCFSoftShadowMap;
    ctxt.gl.shadowMap.needsUpdate = true;

    stage.internal.scene = ctxt.scene;
    setCtxt(ctxt);
  }, [stage.internal]);

  useEffect(() => {
    // NOTE `ctxt?.gl` instead of `ctxt` for hotreloads on edit stage.store
    if (ctxt?.gl && !stage.opts.enabled) {// Detected stage disable
      ctxt.gl.render(ctxt.scene, ctxt.camera);
      stage.extra.canvasPreview = ctxt.gl.domElement.toDataURL();
      stage.internal.scene = undefined;
      useStage.api.persist(stage.key);
      setCtxt(null);
    }
  }, [stage.opts.enabled]);

  const updateShadows = useCallback(() => {
    ctxt?.gl && (ctxt.gl.shadowMap.needsUpdate = true); 
  }, [ctxt]);

  const ptrWire = useRef(new Subject<StagePointerEvent>()).current;
  const onPointer = useCallback((e: ThreeEvent<PointerEvent>) => {
    ptrWire.next({ key: e.type as any, point: e.point });
  }, []);
  /** Change mesh `onPointerOut` type from 'pointermove' to 'pointerleave' */
  const onPointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    ptrWire.next({ key: 'pointerleave', point: e.point });
  }, []);

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
    stage.opts.enabled && stage.opts.panZoom && e.currentTarget.focus(),
    [stage.opts],
  );

  return (
    <Root
      background={stage.opts.enabled && ctxt ? stage.opts.background : '#ccc'}
      tabIndex={0}
      onKeyDown={onKey}
      onKeyUp={onKey}
      onMouseOver={focusOnMouseOver}
    >
      <StageToolbar
        stageKey={stage.key}
        opts={stage.opts}
        selection={stage.sel}
      />

      {(stage.opts.enabled || ctxt) && (

        <CanvasRoot
          dpr={getWindow()!.devicePixelRatio}
          onCreated={onCreatedCanvas}
        >

          <mesh
            onPointerDown={onPointer}
            onPointerMove={onPointer}
            onPointerUp={onPointer}
            onPointerOut={onPointerOut}
            visible={false}
          >
            <planeGeometry args={[100, 100]} />
          </mesh>

          <Grid />
          <Axes />
          <CameraControls
            internal={stage.internal}
            enabled={stage.opts.panZoom}
          />

          <Selection
            sel={stage.sel}
            ptrWire={ptrWire}
          />

          <Cursor
            internal={stage.internal}
            ptrWire={ptrWire}
          />

          <World
            opts={stage.opts}
            poly={stage.poly}
            updateShadows={updateShadows}
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
  border: 0 solid #999;
  border-width: 0 1px;
`;

const Placeholder = styled.div<{}>`
  width: 100%;
  overflow: hidden;
  display: flex;
  height: inherit;
  background: #000;
`;

const PlaceholderImage = styled.img<{}>`
  margin: auto;
  max-width: 100%;
  max-height: 100%;
`;

export default Stage;
