(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5171],{3368:function(n,t,e){"use strict";e.d(t,{Z:function(){return d}});var o,r=e(52209),i=e(79056),a=e(59748),l=e(88269),c=e(48103),s=e(50269),u=e(27375),p=e(8311);function d(n){var t=(0,u.Z)(),e=a.default.useState((function(){var e,r={position:c.dl.from(n.initial),target:c.dl.from(n.initial),dragging:!1,rootEl:{},lineEl:{},circleEl:{},rootRef:function(n){n&&(o.rootEl=n,o.lineEl=n.querySelector("line.drag-indicator"),o.circleEl=n.querySelector("circle.node"),o.circleEl.addEventListener("pointerdown",o.startDrag),o.circleEl.addEventListener("pointerup",o.applyDrag))},startDrag:function(t){var e;t.stopPropagation(),o.dragging=!0,o.lineEl.style.display="inline",o.target.copy(o.position),["x1","x2"].forEach((function(n){return o.lineEl.setAttribute(n,String(o.position.x))})),["y1","y2"].forEach((function(n){return o.lineEl.setAttribute(n,String(o.position.y))}));var r=o.lineEl.ownerSVGElement;r.addEventListener("pointermove",o.onMove),r.addEventListener("pointerleave",o.endDrag),r.addEventListener("pointerup",o.applyDrag),window.addEventListener("keydown",o.endDragOnEscape),r.style.cursor="grabbing",null===(e=n.onStart)||void 0===e||e.call(n)},onMove:function(n){if(n.stopPropagation(),o.dragging){var t=(0,s.zk)({clientX:n.clientX,clientY:n.clientY,ownerSvg:o.lineEl.ownerSVGElement,pointerId:null}),e=t.x,r=t.y,i=new c.dl(e,r);o.position.distanceTo(i)>=20&&(o.target.set(e,r),o.lineEl.setAttribute("x2",String(e)),o.lineEl.setAttribute("y2",String(r)))}},endDrag:function(){if(o.dragging){o.dragging=!1,o.lineEl.style.display="none",o.lineEl.setAttribute("x2",o.lineEl.getAttribute("x1")),o.lineEl.setAttribute("y2",o.lineEl.getAttribute("y1"));var n=o.lineEl.ownerSVGElement;n.removeEventListener("pointermove",o.onMove),n.removeEventListener("pointerleave",o.endDrag),n.removeEventListener("pointerup",o.applyDrag),window.removeEventListener("keydown",o.endDragOnEscape),n.style.cursor="auto"}},applyDrag:function(){var t,e,r;o.dragging&&(o.endDrag(),null!==(t=n.shouldCancel)&&void 0!==t&&t.call(n,o.position.clone(),o.target.clone())||(o.target.distanceTo(o.position)<20?null===(e=n.onClick)||void 0===e||e.call(n,o.position.clone()):(o.moveTo(o.target),null===(r=n.onStop)||void 0===r||r.call(n,o.target.clone()))))},endDragOnEscape:function(n){"Escape"===n.key&&o.endDrag()},moveTo:function(n){o.position.copy(n),o.lineEl.setAttribute("x1",String(o.target.x)),o.lineEl.setAttribute("y1",String(o.target.y)),t()}};return null===(e=n.onLoad)||void 0===e||e.call(n,{moveTo:r.moveTo,getPosition:function(){return o.position.clone()}}),r})),o=(0,i.Z)(e,1)[0],r=n.radius||8;return(0,p.BX)("g",{className:v,ref:o.rootRef,children:[n.icon&&{eye:(0,p.tZ)("image",{className:"icon",href:"/icon/Simple_Icon_Eye.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),down:(0,p.tZ)("image",{className:"icon",href:"/icon/solid_arrow-circle-down.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),right:(0,p.tZ)("image",{className:"icon",href:"/icon/solid_arrow-circle-right.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),run:(0,p.tZ)("image",{className:"icon",href:"/icon/person-running-fa6.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),finish:(0,p.tZ)("image",{className:"icon",href:"/icon/flag-checkered-fa6.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10})}[n.icon]||(0,p.tZ)("circle",{className:"inner-node",cx:o.position.x,cy:o.position.y,r:4}),(0,p.tZ)("circle",{className:"node",cx:o.position.x,cy:o.position.y,r:r}),(0,p.tZ)("line",{className:"drag-indicator",stroke:n.stroke||"blue"})]})}var v=(0,l.iv)(o||(o=(0,r.Z)(["\n  circle.node {\n    fill: rgba(0, 0, 100, 0.1);\n    stroke: rgba(0, 0, 100, 0.2);\n    stroke-dasharray: 4px 4px;\n    cursor: pointer;\n  }\n  circle.inner-node {\n    stroke: black;\n    cursor: pointer;\n    stroke-width: 0.5;\n  }\n  line.drag-indicator {\n    display: none;\n    stroke-width: 2.5;\n    user-select: none;\n    pointer-events: none;\n  }\n"])))},62464:function(n,t,e){"use strict";e.r(t),e.d(t,{default:function(){return b}});var o,r,i=e(52209),a=e(92809),l=(e(59748),e(88269)),c=e(94184),s=e.n(c),u=e(35490),p=e(48103),d=e(91441),v=e(68662),f=e(95814),g=e(19964),h=e(44275),y=e(83159),m=e(3368),w=e(8311);function E(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,o)}return e}function x(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?E(Object(e),!0).forEach((function(t){(0,a.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):E(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function b(n){var t="g-301--bridge",e=(0,f.Z)(t).data,o=(0,g.Z)("g-301--bridge",e,n.disabled).data,r=(0,h.Z)((function(){return{rootEl:{},pathEl:null,source:new p.dl(300,300),target:new p.dl(600,300),path:[],updatePath:function(){if(o){var n,t=o.graph.findPath(r.source,r.target);r.path=t?(0,v.aM)(t):[r.source],r.pathEl=r.pathEl||r.rootEl.querySelector("polyline.navpath"),null===(n=r.pathEl)||void 0===n||n.setAttribute("points","".concat(r.path))}}}}),{deps:[o]});return(0,w.tZ)(y.Z,{gridBounds:u.l,initViewBox:u.r,maxZoom:6,children:(0,w.BX)("g",{className:s()(k,!n.disabled&&Z),ref:function(n){n&&(r.rootEl=n,r.updatePath())},children:[e&&(0,w.tZ)("image",x(x({},e.pngRect),{},{className:"geomorph",href:(0,d.qX)(t)})),!n.disabled&&(null===o||void 0===o?void 0:o.graph.nodesArray.map((function(n){var t=n.vertexIds;return(0,w.tZ)("polygon",{className:"navtri",points:"".concat(t.map((function(n){return o.graph.vectors[n]})))})}))),e&&(0,w.BX)(w.HY,{children:[(0,w.tZ)(m.Z,{initial:r.source,icon:"run",onStop:function(n){if(!e.navPoly.some((function(t){return t.contains(n)})))return"cancel";r.source.copy(n),r.updatePath()}}),(0,w.tZ)("polyline",{className:"navpath",points:"".concat(r.path)}),(0,w.tZ)(m.Z,{initial:r.target,icon:"finish",onStop:function(n){if(!e.navPoly.some((function(t){return t.contains(n)})))return"cancel";r.target.copy(n),r.updatePath()}})]})]})})}var k=(0,l.iv)(o||(o=(0,i.Z)(["\n  border: 1px solid #555555;\n  height: inherit;\n\n  /* image.geomorph, image.icon {\n    filter: invert(100%);\n  } */\n\n  polyline.navpath {\n    fill: none;\n    stroke: #083;\n    stroke-width: 2;\n    stroke-dasharray: 8px;\n    stroke-dashoffset: 16px;\n  }\n\n  @keyframes stringPullFlash {\n    0% { stroke-dashoffset: 16px; }\n    100% { stroke-dashoffset: 0px; }\n  }\n\n  polygon.navtri {\n    fill: transparent;\n    &:hover {\n      stroke: red;\n    }\n  }\n"]))),Z=(0,l.iv)(r||(r=(0,i.Z)(["\n  polyline.navpath {\n    animation: 600ms stringPullFlash infinite linear;\n  }\n"])))},35490:function(n,t,e){"use strict";e.d(t,{l:function(){return r},r:function(){return i}});var o=e(48103),r=new o.UL(-5e3,-5e3,10001,10001),i=new o.UL(0,0,1200,600)},83159:function(n,t,e){"use strict";e.d(t,{Z:function(){return v}});var o,r=e(52209),i=e(79056),a=e(59748),l=e(88269),c=e(94184),s=e.n(c),u=e(48103),p=e(50269),d=e(8311);function v(n){var t=a.useState((function(){var t=n.initViewBox.clone(),i=n.minZoom||.5,a=n.maxZoom||2;return{viewBox:t,panFrom:null,zoom:n.initZoom||1,ptrs:[],ptrDiff:null,root:{},rootCss:(0,l.iv)(o||(o=(0,r.Z)(["\n        width: 100%;\n        height: 100%;\n\n        touch-action: pan-x pan-y pinch-zoom;\n        background-color: ",";\n\n        > g.content {\n          /** TODO justification? */\n          shape-rendering: ",";\n        }\n        > .grid {\n          pointer-events: none;\n        }\n      "])),n.dark?"#000":"none",(0,p.us)()?"optimizeSpeed":"auto"),onPointerDown:function(n){(0,p.af)(n)&&e.ptrs.length<2&&(e.panFrom=(new u.dl).copy((0,p.zk)((0,p.Xs)(n))),e.ptrs.push((0,p.Xs)(n)))},onPointerMove:function(o){if(e.ptrs=e.ptrs.map((function(n){return n.pointerId===o.pointerId?(0,p.Xs)(o):n})),2===e.ptrs.length){var r=Math.abs(e.ptrs[1].clientX-e.ptrs[0].clientX);if(null!==e.ptrDiff){var i,a=(0,p._Y)(e.ptrs);e.zoomTo(a,.02*(r-e.ptrDiff)),e.root.setAttribute("viewBox","".concat(e.viewBox)),null===(i=n.onUpdate)||void 0===i||i.call(n,e.root)}e.ptrDiff=r}else if(e.panFrom){var l,c=(0,p.zk)((0,p.Xs)(o));t.delta(e.panFrom.x-c.x,e.panFrom.y-c.y),e.root.setAttribute("viewBox","".concat(e.viewBox)),null===(l=n.onUpdate)||void 0===l||l.call(n,e.root)}},onPointerUp:function(n){e.panFrom=null,e.ptrs=e.ptrs.filter((function(t){return n.pointerId!==t.pointerId})),e.ptrs.length<2&&(e.ptrDiff=null),1===e.ptrs.length&&(e.panFrom=(new u.dl).copy((0,p.zk)(e.ptrs[0])))},onTouchStart:function(n){n.preventDefault()},onWheel:function(t){if(t.preventDefault(),(0,p.af)(t)){var o,r=(0,p.zk)((0,p.Xs)(t));e.zoomTo(r,-.003*t.deltaY),e.root.setAttribute("viewBox","".concat(e.viewBox)),null===(o=n.onUpdate)||void 0===o||o.call(n,e.root)}},rootRef:function(n){n&&(e.root=n,n.addEventListener("wheel",e.onWheel,{passive:!1}),n.addEventListener("pointerdown",e.onPointerDown,{passive:!0}),n.addEventListener("pointermove",e.onPointerMove,{passive:!0}),n.addEventListener("pointerup",e.onPointerUp,{passive:!0}),n.addEventListener("pointercancel",e.onPointerUp,{passive:!0}),n.addEventListener("pointerleave",e.onPointerUp,{passive:!0}),n.addEventListener("touchstart",e.onTouchStart,{passive:!1}))},zoomTo:function(o,r){var l=Math.min(Math.max(e.zoom+r,i),a);t.x=e.zoom/l*(t.x-o.x)+o.x,t.y=e.zoom/l*(t.y-o.y)+o.y,t.width=1/l*n.initViewBox.width,t.height=1/l*n.initViewBox.height,e.zoom=l}}})),e=(0,i.Z)(t,1)[0];return(0,d.BX)("svg",{ref:e.rootRef,className:e.rootCss,preserveAspectRatio:"xMinYMin slice",viewBox:"".concat(e.viewBox),children:[(0,d.tZ)("g",{className:s()("content",n.className),children:n.children}),(0,d.tZ)(f,{bounds:n.gridBounds,dark:n.dark})]})}function f(n){var t=a.useMemo((function(){return g++}),[]);return(0,d.tZ)(d.HY,{children:[10,60].flatMap((function(e){return[(0,d.tZ)("defs",{children:(0,d.tZ)("pattern",{id:"pattern-grid-".concat(e,"x").concat(e,"--").concat(t),width:e,height:e,patternUnits:"userSpaceOnUse",children:(0,d.tZ)("path",{d:"M ".concat(e," 0 L 0 0 0 ").concat(e),fill:"none",stroke:n.dark?"rgba(200,200,200,0.2)":"rgba(0,0,0,0.5)",strokeWidth:"0.3"})})}),(0,d.tZ)("rect",{className:"grid",x:n.bounds.x,y:n.bounds.y,width:n.bounds.width,height:n.bounds.height,fill:"url(#pattern-grid-".concat(e,"x").concat(e,"--").concat(t,")")})]}))})}var g=0},68662:function(n,t,e){"use strict";e.d(t,{l8:function(){return r},aM:function(){return a},Uq:function(){return l},w1:function(){return i},F3:function(){return c}});e(77503),e(292),e(26470);var o=e(48103);e(7951),e(28949),e(42830),e(89539),e(21801);e(2026),e(48764).Buffer;var r=15;function i(n){var t,e,r=n;return"local-nav"===(null===r||void 0===r?void 0:r.key)&&(null===(t=r.seq)||void 0===t||null===(e=t.every)||void 0===e?void 0:e.call(t,(function(n){var t;return Array.isArray(n)&&(null===n||void 0===n||null===(t=n.every)||void 0===t?void 0:t.call(n,o.dl.isVectJson))||"key"in n&&"room-edge"===n.key})))||!1}function a(n){var t=n.seq.length-1;return n.seq.flatMap((function(n,e){return Array.isArray(n)?n:0===e?n.start:e===t?n.stop:[]}))}function l(n){var t,e,o,r,a=n;return"global-nav"===(null===a||void 0===a?void 0:a.key)&&(null===(t=a.paths)||void 0===t||null===(e=t.every)||void 0===e?void 0:e.call(t,i))&&(null===(o=a.edges)||void 0===o||null===(r=o.every)||void 0===r?void 0:r.call(o,(function(n){return n})))||!1}function c(n){return n in s}var s={cancel:!0,pause:!0,play:!0,"set-player":!0}},69862:function(){},40964:function(){},28949:function(){}}]);