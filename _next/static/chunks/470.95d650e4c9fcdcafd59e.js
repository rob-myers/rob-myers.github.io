"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[470],{97470:function(e,t,n){n.r(t),n.d(t,{default:function(){return Z}});var r,o,i=n(52209),a=n(92809),l=n(30266),c=n(79056),s=n(809),u=n.n(s),p=n(59748),d=n(88269),f=n(88767),g=n(35490),y=n(48103),v=n(68451),E=n(96005),b=n(91441),h=n(83159),m=n(12891),O=n(94184),w=n.n(O),P=n(8311);function k(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function S(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?k(Object(n),!0).forEach((function(t){(0,a.Z)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):k(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function Z(e){var t=p.default.useState((function(){return{rootEl:{},targetEl:{},pathEl:{},source:new y.dl(300,300),target:new y.dl(600,300),path:[],updatePath:function(){var e=r.getGroup(x,n.source);null!==e&&(n.path=[n.source.clone()].concat(r.findPath(n.source,n.target,x,e)||[]),n.pathEl.setAttribute("points","".concat(n.path)))}}})),n=(0,c.Z)(t,1)[0],r=p.default.useMemo((function(){return new E.B}),[]),o=(0,f.useQuery)("navpoly-demo",(0,l.Z)(u().mark((function e(){var t,n,o,i;return u().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch((0,b.tU)("g-301--bridge")).then((function(e){return e.json()}));case 2:return t=e.sent,n=t.navPoly.map((function(e){return y.LA.from(e)})),o=v.J.polysToTriangulation(n),i=E.B.createZone(o),r.setZoneData(x,i),e.abrupt("return",{pngRect:t.pngRect,navPoly:n,zone:i});case 8:case"end":return e.stop()}}),e)})))).data;return(0,P.tZ)(h.Z,{gridBounds:g.l,initViewBox:g.r,maxZoom:6,children:(0,P.BX)("g",{className:w()(j,!e.disabled&&D),ref:function(e){e&&(n.rootEl=e,n.pathEl=e.querySelector("polyline.navpath"),n.updatePath())},children:[o&&(0,P.BX)(P.HY,{children:[(0,P.tZ)("image",S(S({},o.pngRect),{},{className:"geomorph",href:(0,b.qX)("g-301--bridge")})),o.zone.groups.map((function(e){return e.map((function(e){var t=e.vertexIds;return(0,P.tZ)("polygon",{className:"navtri",points:"".concat(t.map((function(e){return o.zone.vertices[e]})))})}))}))]}),(0,P.tZ)("polyline",{className:"navpath",points:"".concat(n.path)}),(0,P.tZ)(m.Z,{initial:n.source,radius:8,onStop:function(e){n.source.copy(e),n.updatePath()},fill:"red"}),(0,P.tZ)(m.Z,{initial:n.target,radius:8,onStop:function(e){n.target.copy(e),n.updatePath()},fill:"blue"})]})})}var j=(0,d.iv)(r||(r=(0,i.Z)(["\n  border: 1px solid #555555;\n  height: inherit;\n\n  polyline.navpath {\n    fill: none;\n    stroke: #083;\n    stroke-width: 4;\n    stroke-dasharray: 8px;\n    stroke-dashoffset: 16px;\n  }\n\n  @keyframes flash {\n    0% { stroke-dashoffset: 16px; }\n    100% { stroke-dashoffset: 0px; }\n  }\n\n  polygon.navtri {\n    fill: transparent;\n    &:hover {\n      stroke: #900;\n    }\n  }\n"]))),D=(0,d.iv)(o||(o=(0,i.Z)(["\n  polyline.navpath {\n    animation: 600ms flash infinite linear;\n  }\n"]))),x="NavStringPullZone"},12891:function(e,t,n){n.d(t,{Z:function(){return f}});var r,o=n(52209),i=n(92809),a=n(79056),l=n(88269),c=n(59748),s=n(48103),u=n(50269),p=n(8311);function d(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function f(e){var t=c.default.useState((function(){return{position:s.dl.from(e.initial),target:s.dl.from(e.initial),dragging:!1,rootEl:{},lineEl:{},circleEl:{},startDrag:function(t){var n;t.stopPropagation(),r.dragging=!0,r.lineEl.style.display="inline",r.target.copy(r.position),["x1","x2"].forEach((function(e){return r.lineEl.setAttribute(e,String(r.position.x))})),["y1","y2"].forEach((function(e){return r.lineEl.setAttribute(e,String(r.position.y))}));var o=r.lineEl.ownerSVGElement;o.addEventListener("pointermove",r.onMove),o.addEventListener("pointerleave",r.endDrag),o.addEventListener("pointerup",r.applyDrag),window.addEventListener("keydown",r.endDragOnEscape),o.style.cursor="grabbing",null===(n=e.onStart)||void 0===n||n.call(e)},onMove:function(e){if(e.stopPropagation(),r.dragging){var t=(0,u.zk)({clientX:e.clientX,clientY:e.clientY,ownerSvg:r.lineEl.ownerSVGElement,pointerId:null}),n=t.x,o=t.y;r.target.set(n,o),r.lineEl.setAttribute("x2",String(n)),r.lineEl.setAttribute("y2",String(o))}},endDrag:function(){r.dragging=!1,r.lineEl.style.display="none",r.lineEl.setAttribute("x2",r.lineEl.getAttribute("x1")),r.lineEl.setAttribute("y2",r.lineEl.getAttribute("y1"));var e=r.lineEl.ownerSVGElement;e.removeEventListener("pointermove",r.onMove),e.removeEventListener("pointerleave",r.endDrag),e.removeEventListener("pointerup",r.applyDrag),window.removeEventListener("keydown",r.endDragOnEscape),e.style.cursor="auto"},applyDrag:function(){var t;r.endDrag(),r.position.copy(r.target),r.lineEl.setAttribute("x1",String(r.target.x)),r.lineEl.setAttribute("y1",String(r.target.y)),o(function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?d(Object(n),!0).forEach((function(t){(0,i.Z)(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):d(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({},r)),null===(t=e.onStop)||void 0===t||t.call(e,s.dl.from(r.position))},endDragOnEscape:function(e){"Escape"===e.key&&r.endDrag()}}})),n=(0,a.Z)(t,2),r=n[0],o=n[1],l=e.radius||10;return(0,p.BX)("g",{className:g,ref:function(e){e&&(r.rootEl=e,r.lineEl=e.querySelector("line.drag-indicator"),r.circleEl=e.querySelector("circle.node"),r.circleEl.addEventListener("pointerdown",r.startDrag),r.circleEl.addEventListener("pointerup",r.applyDrag))},children:[(0,p.tZ)("line",{className:"drag-indicator"}),(0,p.tZ)("circle",{className:"node",fill:e.fill||"blue",cx:r.position.x,cy:r.position.y,r:l})]})}var g=(0,l.iv)(r||(r=(0,o.Z)(["\n  > circle.node {\n    stroke: black;\n    cursor: pointer;\n    stroke-width: 0.5;\n  }\n  > line.drag-indicator {\n    stroke: black;\n    display: none;\n    stroke-width: 2.5;\n    user-select: none;\n    pointer-events: none;\n  }\n"])))}}]);