import * as THREE from "three";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events";
import type { RootState as CanvasContext } from "@react-three/fiber/dist/declarations/src/core/store";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

import type { StageMeta } from "model/stage/stage.model";
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

  useEffect(() => {
    if (ctxt?.gl && !stage.opt.enabled) {// Detected stage disable
      ctxt.gl.render(ctxt.scene, ctxt.camera);
      useStage.api.persist(stage.key);

      // Copy current scene into background scene
      stage.extra.bgScene.remove(...stage.extra.bgScene.children);
      stage.extra.bgScene.add(...ctxt.scene.children);
      stage.extra.bgScene.copy(ctxt.scene, false);
      stage.scene = stage.extra.bgScene;

      setCtxt(null);
    }
  }, [stage.opt.enabled]);

  const on = useMemo(() => {
    const ptrWire = stage.extra.ptrEvent;
    const keyWire = stage.extra.keyEvent;
    return {
      createdCanvas: (ctxt: CanvasContext) => {
        everUsed.current = true;
        stage.ctrl.setDomElement(ctxt.gl.domElement);
        stage.scene = ctxt.scene;
        stage.scene.copy(stage.extra.bgScene, false);
    
        ctxt.gl.shadowMap.enabled = true;
        ctxt.gl.shadowMap.autoUpdate = false;
        ctxt.gl.shadowMap.type = THREE.PCFSoftShadowMap;
        ctxt.gl.shadowMap.needsUpdate = true;
    
        setCtxt(ctxt);
      },
      pointer: (e: ThreeEvent<PointerEvent>) =>
        ptrWire.next({ key: e.type as any, point: e.point }),
      pointerOut: (e: ThreeEvent<PointerEvent>) =>
        ptrWire.next({ key: 'pointerleave', point: e.point }),
      mouseOver: (e: React.MouseEvent<HTMLElement>) =>
        stage.opt.enabled && stage.opt.panZoom && e.currentTarget.focus(),
      key: (e: React.KeyboardEvent<HTMLElement>) => {
        stage.opt.enabled && keyWire?.next({
          key: e.key,
          type: e.type as any,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
        });
      },
    };
  }, [stage.opt, ctxt]);

  const Helpers = useMemo(() =>
    <group name="Helpers">
      <mesh
        name="PointerPlane"
        onPointerDown={on.pointer}
        onPointerMove={on.pointer}
        onPointerUp={on.pointer}
        onPointerOut={on.pointerOut}
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
      onKeyDown={on.key}
      onKeyUp={on.key}
      onMouseOver={on.mouseOver}
    >
      <StageToolbar
        stageKey={stage.key}
        opt={stage.opt}
      />

      {(stage.opt.enabled || ctxt) && (

        <CanvasRoot
          fadeIn={stage.opt.enabled}
          dpr={getWindow()!.devicePixelRatio}
          onCreated={on.createdCanvas}
          camera={stage.extra.sceneCamera}
        >
          {stage.ctrl && <CameraControls
            controls={stage.ctrl}
            captureMouse={stage.opt.panZoom}
          />}

          {Helpers}

          <primitive
            name="Persisted"
            object={stage.extra.sceneGroup}
          />
        </CanvasRoot>

      ) || (
        <Placeholder
          stageKey={stage.key}
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
