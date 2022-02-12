import React from "react";
import { css } from "goober";

import * as defaults from "./defaults";
import { Poly, Rect, Vect } from "../geom";
import { geomorphPngPath } from "../geomorph/geomorph.model";

import PanZoom from "../panzoom/PanZoom";
import useGeomorphJson from "../hooks/use-geomorph-json";
import usePathfinding from "../hooks/use-pathfinding";
import NPCs from "../npc/NPCs";
import Messages from "../npc/Messages";
import { geom } from "../service/geom";
import DraggableNode from "../npc/DraggableNode";

// TODO
// - can change speed
// - tty integration

/** @param {{ disabled?: boolean }} props */
export default function NavCollide(props) {

  /** @type {Geomorph.LayoutKey} */
  const layoutKey = 'g-301--bridge';
  const [state] = React.useState(() => ({

    /** @type {NPC.NPCDef[]} */
    defs: [0, 1, 2].map(i => ({
      key: `npc-${i}`,
      src: new Vect(...[[250, 100], [260, 200], [40, 550]][i]),
      dst: new Vect(...[[600, 500], [600, 340], [1100, 50]][i]),
      zoneKey: layoutKey,
      paused: false, // Initially playing
      angle: 0,
    })),
    api: /** @type {NPC.NPCsApi} */ ({}),
    metas: [0, 1, 2].map(i => ({ wasPlaying: false })),
    testLight: new Vect(205, 385),
  }));

  const { data: gm } = useGeomorphJson(layoutKey);
  const { data: pf } = usePathfinding(layoutKey, gm?.navDecomp, props.disabled);

  React.useEffect(() => {
    if (!pf) {
      return;
    }
    if (props.disabled) {
      state.api.apis.forEach((api, i) => {
        state.metas[i].wasPlaying = api.move.playState === 'running';
        api.pause();
      });
    } else {
      state.api.apis.forEach((api, i) =>
        state.metas[i].wasPlaying && api.play()
      );
    }
  }, [props.disabled, pf]);

  return (
    <PanZoom
      dark
      gridBounds={defaults.gridBounds}
      initViewBox={initViewBox}
      maxZoom={6}
    >
      <g className={rootCss}>

        {gm && <image {...gm.pngRect} className="geomorph" href={geomorphPngPath(layoutKey)} />}

        <g className="navtris">
          {!props.disabled && pf?.zone.groups.map(nodes => nodes.map(({ vertexIds}) =>
            <polygon className="navtri" points={`${vertexIds.map(id => pf.zone.vertices[id])}`} />
          ))}
        </g>

        {pf && <NPCs defs={state.defs} onLoad={api => state.api = api} />}

        {/* TESTING */}
        {gm && <Light init={state.testLight} walls={gm.walls} hull={gm.hull.poly} />}

        <Messages
          onLoad={api => {
            api.createText('test', ['Once upon a time.', 'Foo bar baz qux!', 'Awooga!'], new Vect(260, 300));
            state.defs.forEach(def => {
              api.createText(def.key, [`${def.key}`], def.src);
            });
          }}
        />

      </g>
    </PanZoom>
  );
}

const rootCss = css`
  border: 1px solid #555555;
  height: inherit;

  image {
    /* filter: invert(100%) sepia(50%); */
    /* filter: invert(100%); */
    filter: brightness(40%);
  }

  polygon.navtri {
    fill: transparent;
    &:hover {
      fill: rgba(0, 0, 0, 0.03);
      stroke: #888;
    }
  }

  path.light {
    /* TODO radial fall-off */
    /* TODO flicker on/off */
    /* TODO blur ourside light */
    fill: #ffffff34;
    pointer-events: none;
  }
`;

const initViewBox = new Rect(0, 0, 800, 800);

/** @param {{ init: Geom.Vect; walls: Geom.GeoJsonPolygon[]; hull: Geom.GeoJsonPolygon[] }} props */
function Light({ init, walls, hull }) {

  const [position, setPosition] = React.useState(() => init);

  const light = React.useMemo(() => {
    const hullOutline = Poly.from(hull[0]).removeHoles();
    if (hullOutline.contains(position)) {
      const polys = walls.map(x => Poly.from(x));
      const triangs = polys.flatMap(poly => geom.triangulationToPolys(poly.fastTriangulate()));
      return geom.lightPolygon(position, 2000, triangs);
    } else return new Poly;
  }, [position.x, position.y]);

  return <>
    <path
      className="light"
      d={light.svgPath}
    />
    <DraggableNode
      initial={position}
      onStop={setPosition}
      radius={20}
      stroke="black"
      icon="eye"
    />
  </>;
}