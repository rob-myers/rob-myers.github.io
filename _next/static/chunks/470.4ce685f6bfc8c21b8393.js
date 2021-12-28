"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[470],{97470:function(e,n,t){t.r(n),t.d(n,{default:function(){return O}});var r,i,o=t(52209),a=t(92809),l=t(79056),c=t(59748),s=t(88269),p=t(94184),u=t.n(p),d=t(35490),g=t(48103),f=t(96005),y=t(91441),v=t(83159),h=t(12891),E=t(28645),b=t(8311);function m(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function w(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?m(Object(t),!0).forEach((function(n){(0,a.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):m(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function O(e){var n="g-301--bridge",t=n,r=(0,E.Ui)(n).data,i=(0,E.js)(t,null===r||void 0===r?void 0:r.navDecomp,e.disabled).data,o=c.default.useState((function(){return{rootEl:{},pathEl:null,source:new g.dl(300,300),target:new g.dl(600,300),path:[],updatePath:function(){var e,n,r=f.k.getGroup(t,a.source);null!==r&&(a.path=[a.source.clone()].concat((null===(e=f.k.findPath(a.source,a.target,t,r))||void 0===e?void 0:e.path)||[]),a.pathEl=a.pathEl||a.rootEl.querySelector("polyline.navpath"),null===(n=a.pathEl)||void 0===n||n.setAttribute("points","".concat(a.path)))}}})),a=(0,l.Z)(o,1)[0];return(0,b.tZ)(v.Z,{gridBounds:d.l,initViewBox:P,maxZoom:6,children:(0,b.BX)("g",{className:u()(x,!e.disabled&&k),ref:function(e){e&&(a.rootEl=e,a.updatePath())},children:[r&&(0,b.tZ)("image",w(w({},r.pngRect),{},{className:"geomorph",href:(0,y.qX)(n)})),!e.disabled&&(null===i||void 0===i?void 0:i.zone.groups.map((function(e){return e.map((function(e){var n=e.vertexIds;return(0,b.tZ)("polygon",{className:"navtri",points:"".concat(n.map((function(e){return null===i||void 0===i?void 0:i.zone.vertices[e]})))})}))}))),r&&(0,b.BX)(b.HY,{children:[(0,b.tZ)(h.Z,{initial:a.source,icon:"run",onStop:function(e){if(!r.d.navPoly.some((function(n){return n.contains(e)})))return"cancel";a.source.copy(e),a.updatePath()}}),(0,b.tZ)("polyline",{className:"navpath",points:"".concat(a.path)}),(0,b.tZ)(h.Z,{initial:a.target,icon:"finish",onStop:function(e){if(!r.d.navPoly.some((function(n){return n.contains(e)})))return"cancel";a.target.copy(e),a.updatePath()}})]})]})})}var x=(0,s.iv)(r||(r=(0,o.Z)(["\n  border: 1px solid #555555;\n  height: inherit;\n\n  polyline.navpath {\n    fill: none;\n    stroke: #083;\n    stroke-width: 4;\n    stroke-dasharray: 8px;\n    stroke-dashoffset: 16px;\n  }\n\n  @keyframes stringPullFlash {\n    0% { stroke-dashoffset: 16px; }\n    100% { stroke-dashoffset: 0px; }\n  }\n\n  polygon.navtri {\n    fill: transparent;\n    &:hover {\n      stroke: #900;\n    }\n  }\n"]))),k=(0,s.iv)(i||(i=(0,o.Z)(["\n  polyline.navpath {\n    animation: 600ms stringPullFlash infinite linear;\n  }\n"]))),P=new g.UL(200,0,600,600)},12891:function(e,n,t){t.d(n,{Z:function(){return g}});var r,i=t(52209),o=t(92809),a=t(79056),l=t(88269),c=t(59748),s=t(48103),p=t(50269),u=t(8311);function d(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function g(e){var n=c.default.useState((function(){return{position:s.dl.from(e.initial),target:s.dl.from(e.initial),dragging:!1,rootEl:{},lineEl:{},circleEl:{},startDrag:function(n){var t;n.stopPropagation(),r.dragging=!0,r.lineEl.style.display="inline",r.target.copy(r.position),["x1","x2"].forEach((function(e){return r.lineEl.setAttribute(e,String(r.position.x))})),["y1","y2"].forEach((function(e){return r.lineEl.setAttribute(e,String(r.position.y))}));var i=r.lineEl.ownerSVGElement;i.addEventListener("pointermove",r.onMove),i.addEventListener("pointerleave",r.endDrag),i.addEventListener("pointerup",r.applyDrag),window.addEventListener("keydown",r.endDragOnEscape),i.style.cursor="grabbing",null===(t=e.onStart)||void 0===t||t.call(e)},onMove:function(e){if(e.stopPropagation(),r.dragging){var n=(0,p.zk)({clientX:e.clientX,clientY:e.clientY,ownerSvg:r.lineEl.ownerSVGElement,pointerId:null}),t=n.x,i=n.y;r.target.set(t,i),r.lineEl.setAttribute("x2",String(t)),r.lineEl.setAttribute("y2",String(i))}},endDrag:function(){r.dragging=!1,r.lineEl.style.display="none",r.lineEl.setAttribute("x2",r.lineEl.getAttribute("x1")),r.lineEl.setAttribute("y2",r.lineEl.getAttribute("y1"));var e=r.lineEl.ownerSVGElement;e.removeEventListener("pointermove",r.onMove),e.removeEventListener("pointerleave",r.endDrag),e.removeEventListener("pointerup",r.applyDrag),window.removeEventListener("keydown",r.endDragOnEscape),e.style.cursor="auto"},applyDrag:function(){var n;r.endDrag(),"cancel"===(null===(n=e.onStop)||void 0===n?void 0:n.call(e,s.dl.from(r.target)))||(r.position.copy(r.target),r.lineEl.setAttribute("x1",String(r.target.x)),r.lineEl.setAttribute("y1",String(r.target.y)),i(function(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?d(Object(t),!0).forEach((function(n){(0,o.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):d(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}({},r)))},endDragOnEscape:function(e){"Escape"===e.key&&r.endDrag()}}})),t=(0,a.Z)(n,2),r=t[0],i=t[1],l=e.radius||8;return(0,u.BX)("g",{className:f,ref:function(e){e&&(r.rootEl=e,r.lineEl=e.querySelector("line.drag-indicator"),r.circleEl=e.querySelector("circle.node"),r.circleEl.addEventListener("pointerdown",r.startDrag),r.circleEl.addEventListener("pointerup",r.applyDrag))},children:[e.icon&&{eye:(0,u.tZ)("image",{href:"/icon/Simple_Icon_Eye.svg",width:"20",height:"20",x:r.position.x-10,y:r.position.y-10}),down:(0,u.tZ)("image",{href:"/icon/solid_arrow-circle-down.svg",width:"20",height:"20",x:r.position.x-10,y:r.position.y-10}),right:(0,u.tZ)("image",{href:"/icon/solid_arrow-circle-right.svg",width:"20",height:"20",x:r.position.x-10,y:r.position.y-10}),run:(0,u.tZ)("image",{href:"/icon/person-running-fa6.svg",width:"20",height:"20",x:r.position.x-10,y:r.position.y-10}),finish:(0,u.tZ)("image",{href:"/icon/flag-checkered-fa6.svg",width:"20",height:"20",x:r.position.x-10,y:r.position.y-10})}[e.icon]||(0,u.tZ)("circle",{className:"inner-node",cx:r.position.x,cy:r.position.y,r:l}),(0,u.tZ)("circle",{className:"node",cx:r.position.x,cy:r.position.y,r:l+20}),(0,u.tZ)("line",{className:"drag-indicator",stroke:e.stroke||"blue"})]})}var f=(0,l.iv)(r||(r=(0,i.Z)(["\n  circle.node {\n    fill: rgba(0, 0, 0, 0.2);\n    cursor: pointer;\n  }\n  circle.inner-node {\n    stroke: black;\n    cursor: pointer;\n    stroke-width: 0.5;\n  }\n  line.drag-indicator {\n    display: none;\n    stroke-width: 2.5;\n    user-select: none;\n    pointer-events: none;\n  }\n"])))}}]);