import React from "react";
import classNames from "classnames";
import { css } from "goober";
import useStage from "../hooks/use-stage";

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const stage = useStage(props.stageKey);

  return (
    <div className={classNames('npcs', rootCss)}>
      {
        // TODO
      }
    </div>
  );
}

const rootCss = css`
  position: absolute;
  canvas {
    position: absolute;
    pointer-events: none;
  }
  .npc {
    position: absolute;
  }
`;