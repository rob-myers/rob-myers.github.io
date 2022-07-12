import React from "react";
import classNames from "classnames";
import { css } from "goober";

import { npcOffsetRadians, npcScale } from "../npc/create-npc";
/**
 * TODO modularise
 */
import npcJson from '../../public/npc/first-npc.json'
const { animLookup } = npcJson;

/** @param {Props} props  */
export default function NPC({ npc }) {

  React.useEffect(() => {
    if (npc.anim.spriteSheet === 'idle') {
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
      <div className="interact-circle" />
      <div className="bounds-circle" />
    </div>
  );
}

/**
 * @typedef Props @type {object}
 * @property {NPC.NPC} npc
 */

const npcCss = css`
  position: absolute;
  pointer-events: none;
  
  .body {
    position: absolute;
    filter: grayscale(100%) brightness(140%);
    /** Animate turning */
    transition: transform 1s;
    transform: rotate(calc(${npcOffsetRadians}rad + var(--npc-target-look-angle))) scale(${npcScale});
  }
  
  &.walk .body {
    width: ${animLookup.walk.aabb.width}px;
    height: ${animLookup.walk.aabb.height}px;
    left: ${-animLookup.walk.aabb.width * 0.5}px;
    top: ${-animLookup.walk.aabb.height * 0.5}px;
    background: url('/npc/first-npc--walk.png');
  }

  &.idle .body {
    width: ${animLookup.idle.aabb.width}px;
    height: ${animLookup.idle.aabb.height}px;
    left: ${-animLookup.idle.aabb.width * 0.5}px;
    top: ${-animLookup.idle.aabb.height * 0.5}px;
    background: url('/npc/first-npc--idle.png');
  }

  &.disabled .body {
    animation-play-state: paused;
  }

  .interact-circle {
    display: var(--npcs-debug-display);
    position: absolute;
    width: calc(2 * var(--npcs-interact-radius));
    height: calc(2 * var(--npcs-interact-radius));
    left: calc(-1 * var(--npcs-interact-radius));
    top: calc(-1 * var(--npcs-interact-radius));
    border-radius: calc(2 * var(--npcs-interact-radius));
    border: 1px solid rgba(0, 0, 255, 0.25);
  }

  .bounds-circle {
    display: var(--npcs-debug-display);
    position: absolute;
    width: calc(2 * var(--npc-bounds-radius));
    height: calc(2 * var(--npc-bounds-radius));
    left: calc(-1 * var(--npc-bounds-radius));
    top: calc(-1 * var(--npc-bounds-radius));
    border-radius: calc(2 * var(--npc-bounds-radius));
    border: 1px solid rgba(255, 0, 0, 0.25);
  }
`;
