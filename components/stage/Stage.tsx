import * as THREE from "three";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events";
import type { RootState as CanvasContext } from "@react-three/fiber/dist/declarations/src/core/store";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

import type { StageMeta } from "model/stage/stage.model";
import { Controls } from "model/3d/controls";
import { getWindow } from "model/dom.model";
import useStage from "store/stage.store";

import StageToolbar from "./StageToolbar";
import CameraControls from "./CameraControls";
import Grid from "./Grid";
import Axes from "./Axes";
import Placeholder from "./Placeholder";

const Stage: React.FC<Props> = ({ stage }) => {
  const [ctxt, setCtxt] = useState(null as null | CanvasContext);
  const everUsed = useRef(false);

  const onCreatedCanvas = useCallback((ctxt: CanvasContext) => {
    const camera = ctxt.camera as THREE.OrthographicCamera | THREE.PerspectiveCamera;
    const { initCamZoom, initCamPos, initCamTarget } = useStage.api.getPersist(stage.key).extra;
    everUsed.current = true;

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
      camera.setFocalLength(24);
      camera.near = 1;
    }
    camera.updateProjectionMatrix();

    ctxt.gl.shadowMap.enabled = true;
    ctxt.gl.shadowMap.autoUpdate = false;
    ctxt.gl.shadowMap.type = THREE.PCFSoftShadowMap;
    ctxt.gl.shadowMap.needsUpdate = true;

    stage.scene = ctxt.scene;
    stage.scene.copy(stage.extra.bgScene, false);
    stage.ctrl = ctrl;
    setCtxt(ctxt);
  }, [stage]);

  useEffect(() => {
    if (ctxt?.gl && !stage.opt.enabled) {// Detected stage disable
      ctxt.gl.render(ctxt.scene, ctxt.camera);
      stage.extra.canvasPreview = ctxt.gl.domElement.toDataURL();
      useStage.api.persist(stage.key);

      // Copy current scene into background scene
      stage.extra.bgScene.remove(...stage.extra.bgScene.children);
      stage.extra.bgScene.add(...ctxt.scene.children);
      stage.extra.bgScene.copy(ctxt.scene, false);
      stage.scene = stage.extra.bgScene;

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
    <group name="Helpers">
      <mesh
        name="PointerPlane"
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        onPointerUp={onPointer}
        onPointerOut={onPointerOut}
        visible={false}
        rotation={[-Math.PI/2, 0, 0]}
      >
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <Grid />
      <Axes />
    </group>,
    [],
  );

  return (
    <Root
      tabIndex={0} // For key events
      background="#fff"
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
          fadeIn={stage.opt.enabled}
          dpr={getWindow()!.devicePixelRatio}
          onCreated={onCreatedCanvas}
          // orthographic
        >
          {stage.ctrl && <CameraControls
            controls={stage.ctrl}
            captureMouse={stage.opt.panZoom}
          />}

          {Helpers}

          <primitive
            name="Persisted"
            object={stage.extra.group}
          />
        </CanvasRoot>

      ) || (
        <Placeholder
          stageKey={stage.key}
          dataUrl={stage.extra.canvasPreview}
          everUsed={everUsed.current}
        />
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
  ${({ background }) => css`background: ${background};`}
`;

const CanvasRoot = styled(Canvas)<{ fadeIn: boolean }>`
  @keyframes dark-to-light {
    0% { filter: brightness(10%); }
    100% { filter: brightness(100%); }
  }
  animation: dark-to-light 0.8s ease-in forwards 1;

  background: #fff;
`;

export default Stage;
