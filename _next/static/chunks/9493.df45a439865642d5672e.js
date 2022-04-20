"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9493],{59493:function(n,t,e){e.r(t),t.default='import React from "react";\nimport { css } from "goober";\nimport classNames from "classnames";\n\nimport * as defaults from "./defaults";\nimport { Rect, Vect } from "../geom";\nimport { pathfinding } from \'../pathfinding/Pathfinding\';\nimport { geomorphPngPath } from "../geomorph/geomorph.model";\n\nimport PanZoom from "../panzoom/PanZoom";\nimport DraggableNode from "./svg-nav-demo/DraggableNode";\nimport useGeomorphData from "../hooks/use-geomorph-data";\nimport usePathfinding from "../hooks/use-pathfinding";\n\n/** @param {{ disabled?: boolean }} props */\nexport default function SvgStringPull(props) {\n\n  /** @type {Geomorph.LayoutKey} */\n  const layoutKey = \'g-301--bridge\';\n  const zoneKey = layoutKey;\n  const { data: gm } = useGeomorphData(layoutKey);\n  const { data: pf } = usePathfinding(zoneKey, gm?.navZone, props.disabled);\n\n  const [state] = React.useState(() => ({\n    rootEl: /** @type {SVGGElement} */ ({}),\n    pathEl: /** @type {null | SVGPolylineElement} */ (null),\n\n    source: new Vect(300, 300),\n    target: new Vect(600, 300),\n    path: /** @type {Vect[]} */ ([]),\n\n    updatePath: () => {\n      const groupId = pathfinding.getGroup(zoneKey, state.source);\n      if (groupId !== null) {\n        state.path = [state.source.clone()].concat(\n          pathfinding.findPath(state.source, state.target, zoneKey, groupId)?.path || []\n        );\n        state.pathEl = state.pathEl || state.rootEl.querySelector(\'polyline.navpath\');\n        state.pathEl?.setAttribute(\'points\', `${state.path}`);\n      }\n    },\n  }));\n\n  return (\n    <PanZoom gridBounds={defaults.gridBounds} initViewBox={defaults.initViewBox} maxZoom={6}>\n      <g\n        className={classNames(rootCss, !props.disabled && animateNavpathCss)}\n        ref={(el) => {\n          if (el) {\n            state.rootEl = el;\n            state.updatePath();\n          }\n        }}\n      >\n        {gm && <image {...gm.pngRect} className="geomorph" href={geomorphPngPath(layoutKey)} />}\n\n        {!props.disabled && pf?.zone.groups.map(nodes => nodes.map(({ vertexIds }) =>\n          <polygon className="navtri" points={`${vertexIds.map(id => pf?.zone.vertices[id])}`} />\n        ))}\n\n        {gm && <>\n          <DraggableNode\n            initial={state.source}\n            icon="run"\n            onStop={(p) => {\n              if (!gm.navPoly.some(x => x.contains(p))) return \'cancel\';\n              state.source.copy(p);\n              state.updatePath();\n            }}\n          />\n\n          <polyline className="navpath" points={`${state.path}`}/>\n\n          <DraggableNode\n            initial={state.target}\n            icon="finish"\n            onStop={(p) => {\n              if (!gm.navPoly.some(x => x.contains(p))) return \'cancel\';\n              state.target.copy(p);\n              state.updatePath();\n            }}\n          />\n        </>}\n      </g>\n\n    </PanZoom>\n  );\n}\n\nconst rootCss = css`\n  border: 1px solid #555555;\n  height: inherit;\n\n  image.geomorph {\n    filter: invert(100%);\n  }\n  image.icon {\n    filter: invert(100%);\n  }\n\n  polyline.navpath {\n    fill: none;\n    stroke: #083;\n    stroke-width: 4;\n    stroke-dasharray: 8px;\n    stroke-dashoffset: 16px;\n  }\n\n  @keyframes stringPullFlash {\n    0% { stroke-dashoffset: 16px; }\n    100% { stroke-dashoffset: 0px; }\n  }\n\n  polygon.navtri {\n    fill: transparent;\n    &:hover {\n      stroke: #2b9900;\n    }\n  }\n`;\n\nconst animateNavpathCss = css`\n  polyline.navpath {\n    animation: 600ms stringPullFlash infinite linear;\n  }\n`;\n'}}]);