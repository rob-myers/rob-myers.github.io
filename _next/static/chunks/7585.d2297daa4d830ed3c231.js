"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7585],{27585:function(t,n,e){e.r(n),n.default="import * as React from 'react';\nimport { css } from 'goober';\nimport classNames from 'classnames';\nimport { Vect } from '../geom';\nimport { getSvgPos, getSvgMid, canTouchDevice, projectSvgEvt, isSvgEvent } from '../service/dom';\n\n/** @param {React.PropsWithChildren<Props>} props */\nexport default function PanZoom(props) {\n\n  const [state] = React.useState(() => {\n    const viewBox = props.initViewBox.clone();\n    const minZoom = props.minZoom || 0.5;\n    const maxZoom = props.maxZoom || 2;\n    const wheelDelta = 0.003;\n\n    return {\n      viewBox,\n      /** @type {null | Vect} */\n      panFrom: null,\n      zoom: props.initZoom || 1,\n      /** @type {import('../service/dom').SvgPtr[]} */\n      ptrs: [],\n      /** @type {null | number} */\n      ptrDiff: null,\n      /** @type {SVGSVGElement} */\n      root: ({}),\n      rootCss: css`\n        width: 100%;\n        height: 100%;\n\n        touch-action: pan-x pan-y pinch-zoom;\n        background-color: ${props.dark ? '#000' : 'none'};\n\n        > g.content {\n          shape-rendering: ${canTouchDevice ? 'optimizeSpeed' : 'auto'};\n        }\n        > .grid {\n          pointer-events: none;\n        }\n      `,\n      /** @param {PointerEvent} e */\n      onPointerDown: e => {\n        if (isSvgEvent(e) && state.ptrs.length < 2) {\n          state.panFrom = (new Vect).copy(getSvgPos(projectSvgEvt(e)));\n          state.ptrs.push(projectSvgEvt(e));\n        }\n      },\n      /** @param {PointerEvent} e */\n      onPointerMove: e => {\n        state.ptrs = state.ptrs.map(x => x.pointerId === e.pointerId ? projectSvgEvt(e) : x);\n\n        if (state.ptrs.length === 2) {\n          const ptrDiff = Math.abs(state.ptrs[1].clientX - state.ptrs[0].clientX);\n          if (state.ptrDiff !== null) {\n            const point = getSvgMid(state.ptrs);\n            state.zoomTo(point, 0.02 * (ptrDiff - state.ptrDiff));\n            state.root.setAttribute('viewBox', `${state.viewBox}`);\n            props.onUpdate?.(state.root);\n          }          \n          state.ptrDiff = ptrDiff;\n        } else if (state.panFrom) {\n          const mouse = getSvgPos(projectSvgEvt(e));\n          viewBox.delta(state.panFrom.x - mouse.x, state.panFrom.y - mouse.y);\n          state.root.setAttribute('viewBox', `${state.viewBox}`);\n          props.onUpdate?.(state.root);\n        }\n      },\n      /** @param {PointerEvent} e */\n      onPointerUp: (e) => {\n        state.panFrom = null;\n        state.ptrs = state.ptrs.filter(alt => e.pointerId !== alt.pointerId);\n        if (state.ptrs.length < 2) {\n          state.ptrDiff = null;\n        }\n        if (state.ptrs.length === 1) {\n          state.panFrom = (new Vect).copy(getSvgPos(state.ptrs[0]));\n        }\n      },\n      /** @param {TouchEvent} e */\n      onTouchStart: (e)  => {\n        e.preventDefault();\n      },\n      /** @param {WheelEvent} e */\n      onWheel: e => {\n        e.preventDefault();\n        if (isSvgEvent(e)) {\n          const point = getSvgPos(projectSvgEvt(e));\n          state.zoomTo(point, -wheelDelta * e.deltaY);\n          state.root.setAttribute('viewBox', `${state.viewBox}`);\n          props.onUpdate?.(state.root);\n        }\n      },\n      /** @type {(el: null | SVGSVGElement) => void} */\n      rootRef: el => {\n        if (el) {\n          state.root = el;\n          el.addEventListener('wheel', state.onWheel, { passive: false });\n          el.addEventListener('pointerdown', state.onPointerDown, { passive: true });\n          el.addEventListener('pointermove', state.onPointerMove, { passive: true });\n          el.addEventListener('pointerup', state.onPointerUp, { passive: true });\n          el.addEventListener('pointercancel', state.onPointerUp, { passive: true });\n          el.addEventListener('pointerleave', state.onPointerUp, { passive: true });\n          el.addEventListener('touchstart', state.onTouchStart, { passive: false });\n        }\n      },\n      /**\n       * @param {DOMPoint} point \n       * @param {number} delta \n       */\n       zoomTo: (point, delta) => {\n        const zoom = Math.min(Math.max(state.zoom + delta, minZoom), maxZoom);\n        viewBox.x = (state.zoom / zoom) * (viewBox.x - point.x) + point.x;\n        viewBox.y = (state.zoom / zoom) * (viewBox.y - point.y) + point.y;\n        viewBox.width = (1 / zoom) * props.initViewBox.width;\n        viewBox.height = (1 / zoom) * props.initViewBox.height;\n        state.zoom = zoom;\n      },\n    };\n  });\n\n  return (\n    <svg\n      ref={state.rootRef}\n      className={state.rootCss}\n      preserveAspectRatio=\"xMinYMin slice\"\n      viewBox={`${state.viewBox}`}\n    >\n      <g className={classNames(\"content\", props.className)}>\n        {props.children}\n      </g>\n      <Grid bounds={props.gridBounds} dark={props.dark} />\n    </svg>\n  );\n}\n\n/**\n * @typedef Props @type {object}\n * @property {Geom.Rect} gridBounds World bounds\n * @property {Geom.Rect} initViewBox Initial viewbox in world coords\n * @property {number} [minZoom] Minimum zoom factor (default 0.5)\n * @property {number} [maxZoom] Maximum zoom factor (default 2)\n * @property {number} [initZoom] Initial zoom factor (default 1)\n * @property {string} [className]\n * @property {boolean} [dark] Default false\n * @property {(el: SVGSVGElement) => void} [onUpdate]\n */\n\n/** @param {{ bounds: Geom.Rect; dark?: boolean }} props */\nexport function Grid(props) {\n  const uid = React.useMemo(() => gridPatternCount++, []);\n\n  return <>\n    {[10, 60].flatMap(dim => [\n      <defs>\n        <pattern\n          id={`pattern-grid-${dim}x${dim}--${uid}`}\n          width={dim}\n          height={dim}\n          patternUnits=\"userSpaceOnUse\"\n        >\n          <path\n            d={`M ${dim} 0 L 0 0 0 ${dim}`}\n            fill=\"none\"\n            stroke={props.dark ? \"rgba(200,200,200,0.2)\" : 'rgba(0,0,0,0.5)'}\n            strokeWidth=\"0.3\"\n          />\n        </pattern>\n      </defs>,\n      <rect\n        className=\"grid\"\n        x={props.bounds.x}\n        y={props.bounds.y}\n        width={props.bounds.width}\n        height={props.bounds.height}\n        fill={`url(#pattern-grid-${dim}x${dim}--${uid})`}\n      />\n    ])}\n  </>;\n}\n\nlet gridPatternCount = 0;"}}]);