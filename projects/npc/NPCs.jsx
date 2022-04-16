import React from "react";
import classNames from "classnames";
import { css } from "goober";
import { ensureWire } from "../service/emit.service";
import { Vect } from "../geom";
import { pathfinding } from "../pathfinding/Pathfinding";
import useStateRef from "../hooks/use-state-ref";
import useUpdate from "../hooks/use-update";
import useGeomorphsNav from "../hooks/use-geomorphs-nav";

// TODO further modularisation
import npcJson from '../../public/npc/first-npc.json'

/** @param {NPC.NPCsProps} props */
export default function NPCs(props) {

  const update = useUpdate();

  const nav = useGeomorphsNav(props.gmGraph, props.disabled);
  // console.log(nav);

  const state = useStateRef(() => {
    return {
      /** @type {Record<string, NPC.NPC>} */
      npc: ({}),
      /** @type {React.RefCallback<HTMLDivElement>} */
      npcRef(el) {
        if (el) {
          const npcKey = /** @type {string} */ (el.getAttribute('data-npc-key'));
          const npc = state.npc[npcKey];
          npc.el.root = el;
          el.style.left = `${npc.def.position.x}px`;
          el.style.top = `${npc.def.position.y}px`;
        }
      },
    };
  });
  
  React.useEffect(() => {
    const wire = ensureWire(props.wireKey);
    const sub = wire.subscribe((e) => {
      if (e.key === 'spawn') {
        state.npc[e.npcKey] = {
          key: e.npcKey,
          uid: `${e.npcKey}-${++spawnCount}`,
          def: { key: e.npcKey, position: e.at },
          spriteSheetState: 'idle',
          el: { root: /** @type {HTMLDivElement} */ ({}) },
        };
        update();
      } else if (e.key === 'nav-req') {
        // TODO ✅ send local navpath
        const zoneKey = props.gmGraph.gms[0].key;
        const npc = state.npc[e.npcKey];
        const { x: clientX, y: clientY } = Vect.from(npc.el.root.getBoundingClientRect());
        const src = Vect.from(props.panZoomApi.getWorld({ clientX, clientY }));
        const groupId = pathfinding.getGroup(zoneKey, { x: src.x, y: src.y });
        const path = groupId !== null
          ? [src.clone()].concat(pathfinding.findPath(src, Vect.from(e.dst), zoneKey, groupId)?.path??[])
          : [];
        wire.next({ key: 'nav-res', npcKey: e.npcKey, path });
      }
    });
    return () => sub.unsubscribe();
  }, [props.panZoomApi]);

  return (
    <div className={classNames('npcs', rootCss)}>
      {Object.values(state.npc).map(npc => (
        <div
          key={npc.uid} // Respawn remounts
          data-npc-key={npc.key}
          className={classNames('npc', npc.key, npc.spriteSheetState, npcCss)}
          ref={state.npcRef}            
        >
          <div className={classNames('body', npc.key, 'no-select')} />
        </div>
      ))}
    </div>
  );
}

let spawnCount = 0;

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

const { animLookup: anim, zoom } = npcJson;

const npcCss = css`
  .body {
    cursor: pointer;
    position: absolute;
    transform: scale(0.18);
    pointer-events: all;
    filter: grayscale(100%);
  }
  
  &.walk .body {
    width: ${anim.walk.aabb.width * zoom}px;
    height: ${anim.walk.aabb.height * zoom}px;
    left: ${-anim.walk.aabb.width * zoom * 0.5}px;
    top: ${-anim.walk.aabb.height * zoom * 0.5}px;
    animation: walk 300ms steps(${anim.walk.frames.length}) infinite;
    background: url('/npc/first-npc--walk.png');
  }
  &.idle .body {
    width: ${anim.idle.aabb.width * zoom}px;
    height: ${anim.idle.aabb.height * zoom}px;
    left: ${-anim.idle.aabb.width * zoom * 0.5}px;
    top: ${-anim.idle.aabb.height * zoom * 0.5}px;
    animation: idle 2s steps(${anim.idle.frames.length}) infinite;
    background: url('/npc/first-npc--idle.png');
  }

  &.disabled .body {
    animation-play-state: paused;
  }

  @keyframes walk {
    from { background-position: 0px; }
    to { background-position: ${-anim.walk.frames.length * anim.walk.aabb.width * zoom}px; }
  }
  @keyframes idle {
    from { background-position: 0px; }
    to { background-position: ${-anim.idle.frames.length * anim.idle.aabb.width * zoom}px; }
  }
`;
