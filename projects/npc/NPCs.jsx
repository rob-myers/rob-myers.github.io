import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { ensureWire } from "projects/service/emit.service";

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const wire = ensureWire(props.wireKey);

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