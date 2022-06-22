import React from "react";
import classNames from "classnames";
import { css } from "goober";

/**
 * TODO modularise
 */
import npcJson from '../../public/npc/first-npc.json'
const { animLookup, zoom } = npcJson;

/** @param {{ npc: NPC.NPC; debug: boolean }} props  */
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
      {props.debug && <>
        <div className="interact-circle" />
      </>}
    </div>
  );
}

const npcCss = css`
  position: absolute;
  pointer-events: none;

  .body {
    position: absolute;
    filter: grayscale(100%) brightness(140%);
    /** Animate turning */
    transition: transform 1s;
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

  .interact-circle {
    position: absolute;
    width: calc(2 * var(--npc-interact-radius));
    height: calc(2 * var(--npc-interact-radius));
    left: calc(-1 * var(--npc-interact-radius));
    top: calc(-1 * var(--npc-interact-radius));
    border-radius: calc(2 * var(--npc-interact-radius));
    border: 1px solid rgba(0, 0, 255, 0.25);
  }
`;
