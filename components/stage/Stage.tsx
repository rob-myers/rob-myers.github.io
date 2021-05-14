import * as THREE from "three";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { Canvas } from "@react-three/fiber";
import { ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events";
import type { RootState as CanvasContext } from "@react-three/fiber/dist/declarations/src/core/store";

import type { StageMeta } from "model/stage/stage.model";
import { Controls } from "model/3d/controls";
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
    const { initCamZoom, initCamPos, initCamTarget } = useStage.api.getPersist(stage.key).extra;

    camera.position.set(...initCamPos);
    const ctrl = new Controls(camera, ctxt.gl.domElement);
    ctrl.target.set(...initCamTarget);
    ctrl.maxPolarAngle = Math.PI / 4;
    [ctrl.minZoom, ctrl.maxZoom] = [5, 60];
    [ctrl.minDistance, ctrl.maxDistance] = [5, 80];
    ctrl.screenSpacePanning = false;
    ctrl.enableDamping = true;

    if (camera.type === 'OrthographicCamera') {
      camera.zoom = initCamZoom;
      camera.near = initCamPos[2] - 1000;
    } else {
      camera.setFocalLength(14);
      camera.near = 1;
    }
    camera.updateProjectionMatrix();

    ctxt.gl.shadowMap.enabled = true;
    ctxt.gl.shadowMap.autoUpdate = false;
    ctxt.gl.shadowMap.type = THREE.PCFSoftShadowMap;
    ctxt.gl.shadowMap.needsUpdate = true;

    stage.scene = ctxt.scene;
    stage.ctrl = ctrl;
    setCtxt(ctxt);
  }, [stage]);

  useEffect(() => {
    if (ctxt?.gl && !stage.opt.enabled) {// Detected stage disable
      ctxt.gl.render(ctxt.scene, ctxt.camera);
      stage.extra.canvasPreview = ctxt.gl.domElement.toDataURL();
      useStage.api.persist(stage.key);
      delete stage.scene;
      delete stage.ctrl;
      setCtxt(null);
    }
  }, [stage.opt.enabled]);

  const ptrWire = stage.extra.ptrEvent;
  const onPointer = useCallback((e: ThreeEvent<PointerEvent>) =>
    ptrWire.next({ key: e.type as any, point: e.point }), []);
  const onPointerOut = useCallback((e: ThreeEvent<PointerEvent>) =>
    ptrWire.next({ key: 'pointerleave', point: e.point }), []);
  const focusOnMouseOver = useCallback((e: React.MouseEvent<HTMLElement>) =>
    stage.opt.enabled && stage.opt.panZoom && e.currentTarget.focus(), [stage.opt]);

  const keyWire = stage.extra.keyEvent;
  const onKey = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    keyWire?.next({
      key: e.key,
      type: e.type as any,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
    });
  }, [keyWire]);

  const Helpers = useMemo(() =>
    <>
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
      <Grid />
      <Axes />
    </>,
    [],
  );

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
          {Helpers}

          {stage.ctrl && <CameraControls
            controls={stage.ctrl}
            captureMouse={stage.opt.panZoom}
          />}

          {/* TEMP */}
          <directionalLight name="TempLight" position={[-1, 3, 2]} />
          <mesh name="TempCube" position={[0, .5, 0]}>
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
  background: #444;
  width: 100%;
  overflow: hidden;
  display: flex;
  height: inherit;
`;

const PlaceholderImage = styled.img<{}>`
  background: #ddd;
  margin: auto;
  max-width: 100%;
  max-height: 100%;
`;

export default Stage;
