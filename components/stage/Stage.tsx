import * as THREE from "three";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

import type { StageMeta } from "model/stage/stage.model";
import useStage from "store/stage.store";

import StageToolbar from "./StageToolbar";
import StageCanvas, { StageCtxt } from "./StageCanvas";
import Placeholder from "./Placeholder";

const Stage: React.FC<Props> = ({ stage }) => {
  const everUsed = useRef(false);
  const subscribers = useRef([() => void stage.ctrl.update()]);
  const [ctxt, setCtxt] = useState(null as null | StageCtxt);

  useEffect(() => {
    if (ctxt?.gl && !stage.opt.enabled) {
      // Detected stage disable
      ctxt.gl.render(ctxt.scene, ctxt.camera);
      stage.extra.canvasPreview = ctxt.gl.domElement.toDataURL();
      useStage.api.persist(stage.key);
      // Copy current scene into background scene
      stage.extra.bgScene.remove(...stage.extra.bgScene.children);
      stage.extra.bgScene.add(...ctxt.scene.children);
      stage.extra.bgScene.copy(ctxt.scene, false);
      stage.scene = stage.extra.bgScene;
      setCtxt(null);
    }
  }, [stage.opt.enabled]);

  useEffect(
    () => void (stage.ctrl.capturePanZoom = stage.opt.panZoom),
    [stage.opt.panZoom],
  );

  const on = useMemo(() => {
    const keyWire = stage.extra.keyEvent;
    return {
      createdCanvas: (ctxt: StageCtxt) => {
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
        <StageFader fadeIn={stage.opt.enabled}>
          <StageCanvas
            onCreated={on.createdCanvas}
            camera={stage.extra.sceneCamera}
            group={stage.extra.sceneGroup}
            subscribers={subscribers.current}
          />
        </StageFader>
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
  outline: none;
  ${({ background }) => css`background: ${background};`}
`;

const StageFader = styled.section<{ fadeIn: boolean }>`
  @keyframes dark-to-light {
    0% { filter: brightness(10%); }
    100% { filter: brightness(100%); }
  }
  animation: dark-to-light 1s ease-in forwards 1;
  background: #fff;
  width: 100%;
  height: 100%;
`;

export default Stage;
