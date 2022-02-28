"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5528],{5528:function(e,n,t){t.r(n),t.d(n,{default:function(){return b}});var i,r=t(52209),o=t(92809),l=t(79056),a=t(59748),c=t(88269),s=t(94184),g=t.n(s),d=t(48103),u=t(91441),p=t(68451),f=t(35490),y=t(83159),h=t(17581),v=t(95814),E=t(8311);function m(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);n&&(i=i.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,i)}return t}function w(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?m(Object(t),!0).forEach((function(n){(0,o.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):m(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function b(e){var n=(0,v.Z)(e.layoutKey).data,t=a.default.useState((function(){return{lightA:new d.dl(205,385),lightB:new d.dl(930,385)}})),i=(0,l.Z)(t,1)[0];return(0,E.tZ)(y.Z,{gridBounds:f.l,initViewBox:f.r,maxZoom:6,className:g()(Z,e.disabled&&"disabled"),dark:!0,children:n&&(0,E.BX)(E.HY,{children:[(0,E.tZ)("image",w(w({},n.d.pngRect),{},{className:"geomorph",href:(0,u.qX)(e.layoutKey)})),(0,E.tZ)(x,{init:i.lightA,walls:n.walls,hull:n.hullPoly}),(0,E.tZ)(x,{init:i.lightB,walls:n.walls,hull:n.hullPoly})]})})}function x(e){var n=e.init,t=e.walls,i=e.hull,r=a.default.useState((function(){return n})),o=(0,l.Z)(r,2),c=o[0],s=o[1],g=(0,a.useMemo)((function(){if(i[0].clone().removeHoles().contains(c)){var e=t.flatMap((function(e){return p.J.triangulationToPolys(e.fastTriangulate())}));return p.J.lightPolygon(c,2e3,e)}return new d.LA}),[c.x,c.y]);return(0,E.BX)(E.HY,{children:[(0,E.tZ)("path",{className:"light",d:g.svgPath}),(0,E.tZ)(h.Z,{initial:c,onStop:s,radius:20,stroke:"black",icon:"eye"})]})}var Z=(0,c.iv)(i||(i=(0,r.Z)(["\n  image {\n    filter: contrast(400%);\n  }\n\n  path.light {\n    fill: red;\n    animation: fadein 1s infinite alternate;\n    \n    @keyframes fadein {\n      from { opacity: 0; }\n      to { opacity: 0.4; }\n    }\n  }\n  &.disabled path.light {\n    animation: none;\n    opacity: 0.25;\n  }\n"])))},17581:function(e,n,t){t.d(n,{Z:function(){return u}});var i,r=t(52209),o=t(79056),l=t(59748),a=t(88269),c=t(48103),s=t(50269),g=t(27375),d=t(8311);function u(e){var n=(0,g.Z)(),t=l.default.useState((function(){var t,r={position:c.dl.from(e.initial),target:c.dl.from(e.initial),dragging:!1,rootEl:{},lineEl:{},circleEl:{},rootRef:function(e){e&&(i.rootEl=e,i.lineEl=e.querySelector("line.drag-indicator"),i.circleEl=e.querySelector("circle.node"),i.circleEl.addEventListener("pointerdown",i.startDrag),i.circleEl.addEventListener("pointerup",i.applyDrag))},startDrag:function(n){var t;n.stopPropagation(),i.dragging=!0,i.lineEl.style.display="inline",i.target.copy(i.position),["x1","x2"].forEach((function(e){return i.lineEl.setAttribute(e,String(i.position.x))})),["y1","y2"].forEach((function(e){return i.lineEl.setAttribute(e,String(i.position.y))}));var r=i.lineEl.ownerSVGElement;r.addEventListener("pointermove",i.onMove),r.addEventListener("pointerleave",i.endDrag),r.addEventListener("pointerup",i.applyDrag),window.addEventListener("keydown",i.endDragOnEscape),r.style.cursor="grabbing",null===(t=e.onStart)||void 0===t||t.call(e)},onMove:function(e){if(e.stopPropagation(),i.dragging){var n=(0,s.zk)({clientX:e.clientX,clientY:e.clientY,ownerSvg:i.lineEl.ownerSVGElement,pointerId:null}),t=n.x,r=n.y,o=new c.dl(t,r);i.position.distanceTo(o)>=20&&(i.target.set(t,r),i.lineEl.setAttribute("x2",String(t)),i.lineEl.setAttribute("y2",String(r)))}},endDrag:function(){if(i.dragging){i.dragging=!1,i.lineEl.style.display="none",i.lineEl.setAttribute("x2",i.lineEl.getAttribute("x1")),i.lineEl.setAttribute("y2",i.lineEl.getAttribute("y1"));var e=i.lineEl.ownerSVGElement;e.removeEventListener("pointermove",i.onMove),e.removeEventListener("pointerleave",i.endDrag),e.removeEventListener("pointerup",i.applyDrag),window.removeEventListener("keydown",i.endDragOnEscape),e.style.cursor="auto"}},applyDrag:function(){var n,t,r;i.dragging&&(i.endDrag(),null!==(n=e.shouldCancel)&&void 0!==n&&n.call(e,i.position.clone(),i.target.clone())||(i.target.distanceTo(i.position)<20?null===(t=e.onClick)||void 0===t||t.call(e,i.position.clone()):(i.moveTo(i.target),null===(r=e.onStop)||void 0===r||r.call(e,i.target.clone()))))},endDragOnEscape:function(e){"Escape"===e.key&&i.endDrag()},moveTo:function(e){i.position.copy(e),i.lineEl.setAttribute("x1",String(i.target.x)),i.lineEl.setAttribute("y1",String(i.target.y)),n()}};return null===(t=e.onLoad)||void 0===t||t.call(e,{moveTo:r.moveTo,getPosition:function(){return i.position.clone()}}),r})),i=(0,o.Z)(t,1)[0],r=e.radius||8;return(0,d.BX)("g",{className:p,ref:i.rootRef,children:[e.icon&&{eye:(0,d.tZ)("image",{href:"/icon/Simple_Icon_Eye.svg",width:"20",height:"20",x:i.position.x-10,y:i.position.y-10}),down:(0,d.tZ)("image",{href:"/icon/solid_arrow-circle-down.svg",width:"20",height:"20",x:i.position.x-10,y:i.position.y-10}),right:(0,d.tZ)("image",{href:"/icon/solid_arrow-circle-right.svg",width:"20",height:"20",x:i.position.x-10,y:i.position.y-10}),run:(0,d.tZ)("image",{href:"/icon/person-running-fa6.svg",width:"20",height:"20",x:i.position.x-10,y:i.position.y-10}),finish:(0,d.tZ)("image",{href:"/icon/flag-checkered-fa6.svg",width:"20",height:"20",x:i.position.x-10,y:i.position.y-10})}[e.icon]||(0,d.tZ)("circle",{className:"inner-node",cx:i.position.x,cy:i.position.y,r:4}),(0,d.tZ)("circle",{className:"node",cx:i.position.x,cy:i.position.y,r:r}),(0,d.tZ)("line",{className:"drag-indicator",stroke:e.stroke||"blue"})]})}var p=(0,a.iv)(i||(i=(0,r.Z)(["\n  circle.node {\n    fill: rgba(0, 0, 100, 0.1);\n    stroke: rgba(0, 0, 100, 0.2);\n    stroke-dasharray: 4px 4px;\n    cursor: pointer;\n  }\n  circle.inner-node {\n    stroke: black;\n    cursor: pointer;\n    stroke-width: 0.5;\n  }\n  line.drag-indicator {\n    display: none;\n    stroke-width: 2.5;\n    user-select: none;\n    pointer-events: none;\n  }\n"])))}}]);