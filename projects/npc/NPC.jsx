import React from "react";
import classNames from "classnames";
import { css } from "goober";

// TODO modularise
import npcJson from '../../public/npc/first-npc.json'
const { animLookup, zoom } = npcJson;

/** @param {{ npc: NPC.NPC }} props  */
export default function NPC(props) {
  const { npc } = props;

  React.useEffect(() => {
    if (npc.anim.spriteSheet === 'idle' && npc.anim.aux.count === 0) {
      npc.startAnimation(); // Start idle animation 
    }
    return () => {
      window.clearTimeout(npc.anim.wayTimeoutId);
    };
  }, []);

  return (
    <div
      ref={npc.npcRef.bind(npc)}
      className={classNames('npc', npc.key, npc.anim.spriteSheet, npcCss)}
      data-npc-key={npc.key}
    >
      <div
        className={classNames('body', npc.key, 'no-select')}
        data-npc-key={npc.key}
      />
    </div>
  );
}

const npcCss = css`
  .body {
    /* cursor: pointer; */
    position: absolute;
    filter: grayscale(100%) brightness(140%);
    /* transform: scale(0.18) rotate(90deg); */
  }
  
  &.walk .body {
    width: ${animLookup.walk.aabb.width * zoom}px;
    height: ${animLookup.walk.aabb.height * zoom}px;
    left: ${-animLookup.walk.aabb.width * zoom * 0.5}px;
    top: ${-animLookup.walk.aabb.height * zoom * 0.5}px;
    background: url('/npc/first-npc--walk.png');
  }

  &.idle .body {
    width: ${animLookup.idle.aabb.width * zoom}px;
    height: ${animLookup.idle.aabb.height * zoom}px;
    left: ${-animLookup.idle.aabb.width * zoom * 0.5}px;
    top: ${-animLookup.idle.aabb.height * zoom * 0.5}px;
    background: url('/npc/first-npc--idle.png');
  }

  &.disabled .body {
    animation-play-state: paused;
  }
`;