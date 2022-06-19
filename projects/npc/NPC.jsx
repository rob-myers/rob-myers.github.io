import React from "react";
import classNames from "classnames";
import { css } from "goober";

/**
 * TODO modularise
 */
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
      <div
        className="icon"
        onClick={(e) => {
          const target = /** @type {HTMLElement} */ (e.target);
          target.classList.toggle('visible');
          setTimeout(() => target.classList.remove('visible'), 1000);
        }}
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

  .icon {
    position: absolute;
    left: calc(-7px - 0 * 7px);
    top: -7px;
    border-radius: 7px;
    width: 14px;
    height: 14px;
    
    pointer-events: all;
    cursor: pointer;
    opacity: 1;
    transition: opacity 1s;
  }
  .icon:not(.visible) {
    opacity: 0;
  }

  &.idle .icon {
    background: rgba(255, 255, 255, 0.4);

    &::after {
      display: block;
      content: '';
      background-image: url(/icon/arrow-rotate-both.svg);
      background-size: 14px 14px;
      height: 14px;
      width: 14px;
      transform: scale(0.4);
    }
  }
`;
