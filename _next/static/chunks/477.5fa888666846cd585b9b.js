"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[477],{89477:function(n,t,e){e.r(t),e.d(t,{default:function(){return O}});var r,i=e(52209),o=e(92809),a=e(79056),c=e(59748),l=e(88269),s=e(35490),u=e(48103),p=e(91441),d=e(83159),f=e(28645),g=e(96005),v=e(12891),y=e(8311);function h(n){var t=c.default.useState((function(){return{pathEl:{},path:[],src:u.dl.from(n.initial.src),dst:u.dl.from(n.initial.dst),setPath:function(n){e.path=n,e.pathEl.setAttribute("points","".concat(e.path))},updatePath:function(){var t,r,i=g.k.getGroup(n.zoneKey,e.src);null!==i&&(e.path=[e.src.clone()].concat((null===(t=g.k.findPath(e.src,e.dst,n.zoneKey,i))||void 0===t?void 0:t.path)||[]),e.setPath(e.path),null===(r=n.onChange)||void 0===r||r.call(n,e.path))},pointInZone:function(t){var e=g.k.zones[n.zoneKey];return e.groups.flatMap((function(n){return n})).map((function(n){return n.vertexIds.map((function(n){return e.vertices[n]}))})).some((function(n){var e=(0,a.Z)(n,3),r=e[0],i=e[1],o=e[2];return u.LA.pointInTriangle(t,r,i,o)}))}}})),e=(0,a.Z)(t,1)[0];return c.default.useEffect((function(){n.zoneKey in g.k.zones&&e.updatePath()}),[g.k.zones[n.zoneKey]]),(0,y.BX)("g",{ref:function(n){n&&(e.pathEl=n.querySelector("polyline.navpath"))},children:[(0,y.tZ)("polyline",{className:"navpath"}),(0,y.tZ)(v.Z,{initial:n.initial.src,radius:n.radius,icon:n.srcIcon,onStart:function(){var t;return null===(t=n.onStart)||void 0===t?void 0:t.call(n,"src")},onStop:function(n){if(!e.pointInZone(n))return"cancel";e.src.copy(n),e.updatePath()}}),(0,y.tZ)(v.Z,{initial:n.initial.dst,radius:n.radius,icon:n.dstIcon,onStart:function(){var t;return null===(t=n.onStart)||void 0===t?void 0:t.call(n,"dst")},onStop:function(n){if(!e.pointInZone(n))return"cancel";e.dst.copy(n),e.updatePath()}})]})}function b(n){var t=c.default.useState((function(){var t={bot:{},api:{anim:{},enabled:n.enabled}};return n.onLoad(t.api),t})),e=(0,a.Z)(t,1)[0];return(0,y.BX)("g",{className:E,children:[(0,y.tZ)(h,{initial:{src:n.initSrc,dst:n.initDst},zoneKey:n.zoneKey,radius:4,onChange:function(n){var t=e.bot,r=e.api;if(t&&n.length){var i=n.map((function(t,e){return{p:t,q:n[e+1]}})).slice(0,-1).map((function(n){var t=n.p,e=n.q;return t.distanceTo(e)})).reduce((function(n,t){return n.total+=t,n.sofars.push(n.sofars[n.sofars.length-1]+t),n}),{sofars:[0],total:0}),o=i.sofars,a=i.total;r.anim=t.animate(n.map((function(n,t){return{offset:o[t]/a,transform:"translate(".concat(n.x,"px, ").concat(n.y,"px)")}})),{duration:5e3,iterations:1/0,direction:"alternate"}),r.enabled||r.anim.pause()}}}),(0,y.BX)("g",{className:"bot",ref:function(t){t&&e.bot!==t&&(e.bot=t,e.bot.animate([{transform:"translate(".concat(n.initSrc.x,"px, ").concat(n.initSrc.y,"px)")}],{fill:"forwards"}))},children:[(0,y.tZ)("circle",{fill:"red",stroke:"black",strokeWidth:2,r:10}),(0,y.tZ)("line",{stroke:"black",strokeWidth:2,x2:10})]})]})}var m,E=(0,l.iv)(r||(r=(0,i.Z)(["\n  polyline.navpath {\n    fill: none;\n    stroke: #777;\n    stroke-width: 2;\n    stroke-dasharray: 8px;\n    stroke-dashoffset: 16px;\n  }\n\n  g.bot {\n    pointer-events: none;\n  }\n"])));function w(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,r)}return e}function x(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?w(Object(e),!0).forEach((function(t){(0,o.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):w(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function O(n){var t="g-301--bridge",e=c.default.useState((function(){return{initSrc:new u.dl(300,300),initDst:new u.dl(600,300),npcApi:{}}})),r=(0,a.Z)(e,1)[0],i=(0,f.U)(t).data,o=(0,f.j)(t,null===i||void 0===i?void 0:i.navDecomp,n.disabled).data;return c.default.useEffect((function(){var t,e,i,o,a,c;n.disabled?null===(t=r.npcApi)||void 0===t||null===(e=(i=t.anim).pause)||void 0===e||e.call(i):null===(o=r.npcApi)||void 0===o||null===(a=(c=o.anim).play)||void 0===a||a.call(c);r.npcApi.enabled=!n.disabled}),[n.disabled]),(0,y.tZ)(d.Z,{gridBounds:s.l,initViewBox:Z,maxZoom:6,children:(0,y.BX)("g",{className:S,children:[i&&(0,y.tZ)("image",x(x({},i.pngRect),{},{className:"geomorph",href:(0,p.qX)(t)})),null===o||void 0===o?void 0:o.zone.groups.map((function(n){return n.map((function(n){var t=n.vertexIds;return(0,y.tZ)("polygon",{className:"navtri",points:"".concat(t.map((function(n){return o.zone.vertices[n]})))})}))})),(0,y.tZ)(b,{enabled:!!o,initSrc:r.initSrc,initDst:r.initDst,zoneKey:t,onLoad:function(n){r.npcApi=n}})]})})}var S=(0,l.iv)(m||(m=(0,i.Z)(["\n  border: 1px solid #555555;\n  height: inherit;\n\n  polygon.navtri {\n    fill: transparent;\n    &:hover {\n      stroke: #900;\n    }\n  }\n"]))),Z=new u.UL(200,0,600,600)},12891:function(n,t,e){e.d(t,{Z:function(){return f}});var r,i=e(52209),o=e(92809),a=e(79056),c=e(88269),l=e(59748),s=e(48103),u=e(50269),p=e(8311);function d(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,r)}return e}function f(n){var t=l.default.useState((function(){return{position:s.dl.from(n.initial),target:s.dl.from(n.initial),dragging:!1,rootEl:{},lineEl:{},circleEl:{},startDrag:function(t){var e;t.stopPropagation(),r.dragging=!0,r.lineEl.style.display="inline",r.target.copy(r.position),["x1","x2"].forEach((function(n){return r.lineEl.setAttribute(n,String(r.position.x))})),["y1","y2"].forEach((function(n){return r.lineEl.setAttribute(n,String(r.position.y))}));var i=r.lineEl.ownerSVGElement;i.addEventListener("pointermove",r.onMove),i.addEventListener("pointerleave",r.endDrag),i.addEventListener("pointerup",r.applyDrag),window.addEventListener("keydown",r.endDragOnEscape),i.style.cursor="grabbing",null===(e=n.onStart)||void 0===e||e.call(n)},onMove:function(n){if(n.stopPropagation(),r.dragging){var t=(0,u.zk)({clientX:n.clientX,clientY:n.clientY,ownerSvg:r.lineEl.ownerSVGElement,pointerId:null}),e=t.x,i=t.y;r.target.set(e,i),r.lineEl.setAttribute("x2",String(e)),r.lineEl.setAttribute("y2",String(i))}},endDrag:function(){r.dragging=!1,r.lineEl.style.display="none",r.lineEl.setAttribute("x2",r.lineEl.getAttribute("x1")),r.lineEl.setAttribute("y2",r.lineEl.getAttribute("y1"));var n=r.lineEl.ownerSVGElement;n.removeEventListener("pointermove",r.onMove),n.removeEventListener("pointerleave",r.endDrag),n.removeEventListener("pointerup",r.applyDrag),window.removeEventListener("keydown",r.endDragOnEscape),n.style.cursor="auto"},applyDrag:function(){var t;r.endDrag(),"cancel"===(null===(t=n.onStop)||void 0===t?void 0:t.call(n,s.dl.from(r.target)))||(r.position.copy(r.target),r.lineEl.setAttribute("x1",String(r.target.x)),r.lineEl.setAttribute("y1",String(r.target.y)),i(function(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?d(Object(e),!0).forEach((function(t){(0,o.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):d(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}({},r)))},endDragOnEscape:function(n){"Escape"===n.key&&r.endDrag()}}})),e=(0,a.Z)(t,2),r=e[0],i=e[1],c=n.radius||8;return(0,p.BX)("g",{className:g,ref:function(n){n&&(r.rootEl=n,r.lineEl=n.querySelector("line.drag-indicator"),r.circleEl=n.querySelector("circle.node"),r.circleEl.addEventListener("pointerdown",r.startDrag),r.circleEl.addEventListener("pointerup",r.applyDrag))},children:[n.icon&&{eye:(0,p.tZ)("image",{href:"/icon/Simple_Icon_Eye.svg",width:"20",height:"20",x:r.position.x-10,y:r.position.y-10}),down:(0,p.tZ)("image",{href:"/icon/solid_arrow-circle-down.svg",width:"20",height:"20",x:r.position.x-10,y:r.position.y-10}),right:(0,p.tZ)("image",{href:"/icon/solid_arrow-circle-right.svg",width:"20",height:"20",x:r.position.x-10,y:r.position.y-10}),run:(0,p.tZ)("image",{href:"/icon/person-running-fa6.svg",width:"20",height:"20",x:r.position.x-10,y:r.position.y-10}),finish:(0,p.tZ)("image",{href:"/icon/flag-checkered-fa6.svg",width:"20",height:"20",x:r.position.x-10,y:r.position.y-10})}[n.icon]||(0,p.tZ)("circle",{className:"inner-node",cx:r.position.x,cy:r.position.y,r:c}),(0,p.tZ)("circle",{className:"node",cx:r.position.x,cy:r.position.y,r:c+20}),(0,p.tZ)("line",{className:"drag-indicator",stroke:n.stroke||"blue"})]})}var g=(0,c.iv)(r||(r=(0,i.Z)(["\n  circle.node {\n    fill: rgba(0, 0, 0, 0.2);\n    cursor: pointer;\n  }\n  circle.inner-node {\n    stroke: black;\n    cursor: pointer;\n    stroke-width: 0.5;\n  }\n  line.drag-indicator {\n    display: none;\n    stroke-width: 2.5;\n    user-select: none;\n    pointer-events: none;\n  }\n"])))}}]);