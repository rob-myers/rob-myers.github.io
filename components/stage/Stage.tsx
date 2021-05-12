import * as THREE from "three";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Canvas } from "@react-three/fiber";
import { ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events";
import type { RootState as CanvasContext } from "@react-three/fiber/dist/declarations/src/core/store";

import type { StageMeta } from "model/stage/stage.model";
import { getWindow } from "model/dom.model";
import useStage from "store/stage.store";

import StageToolbar from "./StageToolbar";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import Axes from "./Axes";

const Stage: React.FC<Props> = ({ stage }) => {
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);

  const onCreatedCanvas = useCallback((ctxt: CanvasContext) => {
    const camera = ctxt.camera as THREE.OrthographicCamera | THREE.PerspectiveCamera;
    const { initCameraZoom, initCameraPos: [x, y, z] } = useStage.api.getPersist(stage.key).extra;
    camera.position.set(x, y, z);

    if (camera.type === 'OrthographicCamera') {
      camera.zoom = Math.max(20, initCameraZoom);
      camera.near = z - 1000;
    }
    camera.updateProjectionMatrix();

    ctxt.gl.shadowMap.enabled = true;
    ctxt.gl.shadowMap.autoUpdate = false;
    ctxt.gl.shadowMap.type = THREE.PCFSoftShadowMap;
    ctxt.gl.shadowMap.needsUpdate = true;

    stage.root.scene = ctxt.scene;
    setCtxt(ctxt);
  }, [stage.root]);

  useEffect(() => {
    if (ctxt?.gl && !stage.opt.enabled) {// Detected stage disable
      ctxt.gl.render(ctxt.scene, ctxt.camera);
      stage.extra.canvasPreview = ctxt.gl.domElement.toDataURL();
      delete stage.root.scene;
      useStage.api.persist(stage.key);
      setCtxt(null);
    }
  }, [stage.opt.enabled]);

  const ptrWire = stage.root.ptrEvt;
  const onPointer = useCallback((e: ThreeEvent<PointerEvent>) =>
    ptrWire.next({ key: e.type as any, point: e.point }), []);
    
  const onPointerOut = useCallback((e: ThreeEvent<PointerEvent>) =>
    ptrWire.next({ key: 'pointerleave', point: e.point }), []);
  const focusOnMouseOver = useCallback((e: React.MouseEvent<HTMLElement>) =>
    stage.opt.enabled && stage.opt.panZoom && e.currentTarget.focus(), [stage.opt]);

  const keyWire = stage.root.keyEvt;
  const onKey = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    keyWire?.next({
      key: e.key,
      type: e.type as any,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
    });
  }, [keyWire]);

  const Indicators = useMemo(() => <>
    <Grid />
    <Axes />
  </>, []);

  return (
    <Root
      background="#fff"
      tabIndex={0}
      onKeyDown={onKey}
      onKeyUp={onKey}
      onMouseOver={focusOnMouseOver}
    >
      <StageToolbar
        stageKey={stage.key}
        opt={stage.opt}
      />

      {(stage.opt.enabled || ctxt) && (

        <CanvasRoot
          dpr={getWindow()!.devicePixelRatio}
          onCreated={onCreatedCanvas}
          // orthographic
        >
          <mesh
            name="PointerPlane"
            onPointerDown={onPointer}
            onPointerMove={onPointer}
            onPointerUp={onPointer}
            onPointerOut={onPointerOut}
            visible={false}
            // matrixAutoUpdate={false}
            rotation={[-Math.PI/2, 0, 0]}
          >
            <planeGeometry args={[40, 40]} />
            <meshBasicMaterial color="red" />
          </mesh>

          {Indicators}

          <CameraControls
            root={stage.root}
            captureMouse={stage.opt.panZoom}
          />

          {/* TEMP */}
          <directionalLight position={[-1, 3, 2]} />
          <mesh position={[0, .5, 0]}>
            <boxGeometry/>
            <meshStandardMaterial color="#00f" />
          </mesh>

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
  background: #fff;
`;

const Placeholder = styled.div<{}>`
  width: 100%;
  overflow: hidden;
  display: flex;
  height: inherit;
  background: #fff;
`;

const PlaceholderImage = styled.img<{}>`
  margin: auto;
  max-width: 100%;
  max-height: 100%;
`;

export default Stage;
