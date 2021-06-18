import * as THREE from "three";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

import type { StageMeta, StageView } from "model/stage/stage.model";
import useStage from "store/stage.store";

import StageToolbar from "./StageToolbar";
import StageCanvas, { StageCtxt } from "./StageCanvas";
import Placeholder from "./Placeholder";

export default function Stage({ stage, view }: Props) {
  const everUsed = useRef(false);
  const subscribers = useRef([() => void view.ctrl.update()]);
  const [ctxt, setCtxt] = useState(null as null | StageCtxt);

  useEffect(() => {
    if (ctxt && !view.opt.enabled) {
      // Detected stage disable
      ctxt.gl.render(ctxt.scene, ctxt.camera);
      view.canvasPreview = ctxt.gl.domElement.toDataURL();
      useStage.api.persistStage(stage.key);
      setCtxt(null);
    }
  }, [view.opt.enabled]);

  useEffect(
    () => void (view.ctrl.capturePanZoom = view.opt.panZoom),
    [view.opt.panZoom],
  );

  const on = useMemo(() => {
    const keyWire = stage.extra.keyEvent;
    return {
      createdCanvas: (ctxt: StageCtxt) => {
        everUsed.current = true;
        view.ctrl.setDomElement(ctxt.gl.domElement);
        ctxt.gl.shadowMap.enabled = true;
        ctxt.gl.shadowMap.autoUpdate = false;
        ctxt.gl.shadowMap.type = THREE.PCFSoftShadowMap;
        ctxt.gl.shadowMap.needsUpdate = true;
    
        setCtxt(ctxt);
      },
      mouseOver: (e: React.MouseEvent<HTMLElement>) =>
        view.opt.enabled && view.opt.panZoom && e.currentTarget.focus(),
      key: (e: React.KeyboardEvent<HTMLElement>) => {
        view.opt.enabled && keyWire?.next({
          key: e.key,
          type: e.type as any,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
        });
      },
    };
  }, [view.opt, ctxt]);

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
        viewKey={view.key}
        opt={view.opt}
      />
      {(view.opt.enabled || ctxt) && (
        <StageFader fadeIn={view.opt.enabled}>
          <StageCanvas
            onCreated={on.createdCanvas}
            camera={view.camera}
            scene={stage.scene}
            subscribers={subscribers.current}
          />
        </StageFader>
      ) || (
        <Placeholder
          viewKey={view.key}
          dataUrl={view.canvasPreview}
          everUsed={everUsed.current}
        />
      )}
    </Root>
  );
}

interface Props {
  stage: StageMeta;
  view: StageView;
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
