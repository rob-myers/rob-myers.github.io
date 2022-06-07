"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5878],{3368:function(n,t,e){e.d(t,{Z:function(){return d}});var o,r=e(52209),i=e(79056),a=e(59748),c=e(88269),l=e(48103),s=e(50269),u=e(27375),p=e(8311);function d(n){var t=(0,u.Z)(),e=a.default.useState((function(){var e,r={position:l.dl.from(n.initial),target:l.dl.from(n.initial),dragging:!1,rootEl:{},lineEl:{},circleEl:{},rootRef:function(n){n&&(o.rootEl=n,o.lineEl=n.querySelector("line.drag-indicator"),o.circleEl=n.querySelector("circle.node"),o.circleEl.addEventListener("pointerdown",o.startDrag),o.circleEl.addEventListener("pointerup",o.applyDrag))},startDrag:function(t){var e;t.stopPropagation(),o.dragging=!0,o.lineEl.style.display="inline",o.target.copy(o.position),["x1","x2"].forEach((function(n){return o.lineEl.setAttribute(n,String(o.position.x))})),["y1","y2"].forEach((function(n){return o.lineEl.setAttribute(n,String(o.position.y))}));var r=o.lineEl.ownerSVGElement;r.addEventListener("pointermove",o.onMove),r.addEventListener("pointerleave",o.endDrag),r.addEventListener("pointerup",o.applyDrag),window.addEventListener("keydown",o.endDragOnEscape),r.style.cursor="grabbing",null===(e=n.onStart)||void 0===e||e.call(n)},onMove:function(n){if(n.stopPropagation(),o.dragging){var t=(0,s.zk)({clientX:n.clientX,clientY:n.clientY,ownerSvg:o.lineEl.ownerSVGElement,pointerId:null}),e=t.x,r=t.y,i=new l.dl(e,r);o.position.distanceTo(i)>=20&&(o.target.set(e,r),o.lineEl.setAttribute("x2",String(e)),o.lineEl.setAttribute("y2",String(r)))}},endDrag:function(){if(o.dragging){o.dragging=!1,o.lineEl.style.display="none",o.lineEl.setAttribute("x2",o.lineEl.getAttribute("x1")),o.lineEl.setAttribute("y2",o.lineEl.getAttribute("y1"));var n=o.lineEl.ownerSVGElement;n.removeEventListener("pointermove",o.onMove),n.removeEventListener("pointerleave",o.endDrag),n.removeEventListener("pointerup",o.applyDrag),window.removeEventListener("keydown",o.endDragOnEscape),n.style.cursor="auto"}},applyDrag:function(){var t,e,r;o.dragging&&(o.endDrag(),null!==(t=n.shouldCancel)&&void 0!==t&&t.call(n,o.position.clone(),o.target.clone())||(o.target.distanceTo(o.position)<20?null===(e=n.onClick)||void 0===e||e.call(n,o.position.clone()):(o.moveTo(o.target),null===(r=n.onStop)||void 0===r||r.call(n,o.target.clone()))))},endDragOnEscape:function(n){"Escape"===n.key&&o.endDrag()},moveTo:function(n){o.position.copy(n),o.lineEl.setAttribute("x1",String(o.target.x)),o.lineEl.setAttribute("y1",String(o.target.y)),t()}};return null===(e=n.onLoad)||void 0===e||e.call(n,{moveTo:r.moveTo,getPosition:function(){return o.position.clone()}}),r})),o=(0,i.Z)(e,1)[0],r=n.radius||8;return(0,p.BX)("g",{className:f,ref:o.rootRef,children:[n.icon&&{eye:(0,p.tZ)("image",{className:"icon",href:"/icon/Simple_Icon_Eye.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),down:(0,p.tZ)("image",{className:"icon",href:"/icon/solid_arrow-circle-down.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),right:(0,p.tZ)("image",{className:"icon",href:"/icon/solid_arrow-circle-right.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),run:(0,p.tZ)("image",{className:"icon",href:"/icon/person-running-fa6.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),finish:(0,p.tZ)("image",{className:"icon",href:"/icon/flag-checkered-fa6.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10})}[n.icon]||(0,p.tZ)("circle",{className:"inner-node",cx:o.position.x,cy:o.position.y,r:4}),(0,p.tZ)("circle",{className:"node",cx:o.position.x,cy:o.position.y,r:r}),(0,p.tZ)("line",{className:"drag-indicator",stroke:n.stroke||"blue"})]})}var f=(0,c.iv)(o||(o=(0,r.Z)(["\n  circle.node {\n    fill: rgba(0, 0, 100, 0.1);\n    stroke: rgba(0, 0, 100, 0.2);\n    stroke-dasharray: 4px 4px;\n    cursor: pointer;\n  }\n  circle.inner-node {\n    stroke: black;\n    cursor: pointer;\n    stroke-width: 0.5;\n  }\n  line.drag-indicator {\n    display: none;\n    stroke-width: 2.5;\n    user-select: none;\n    pointer-events: none;\n  }\n"])))},75878:function(n,t,e){e.r(t),e.d(t,{default:function(){return x}});var o,r=e(52209),i=e(92809),a=e(79056),c=e(59748),l=e(88269),s=e(94184),u=e.n(s),p=e(48103),d=e(91441),f=e(68451),g=e(35490),h=e(83159),v=e(3368),m=e(95814),y=e(8311);function w(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,o)}return e}function b(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?w(Object(e),!0).forEach((function(t){(0,i.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):w(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function x(n){var t=(0,m.Z)(n.layoutKey).data,e=c.default.useState((function(){return{lightA:new p.dl(205,385),lightB:new p.dl(1e3,400)}})),o=(0,a.Z)(e,1)[0];return(0,y.tZ)(h.Z,{gridBounds:g.l,initViewBox:g.r,maxZoom:6,className:u()(Z,n.disabled&&"disabled"),children:t&&(0,y.BX)(y.HY,{children:[(0,y.tZ)("image",b(b({},t.pngRect),{},{className:"geomorph",href:(0,d.qX)(n.layoutKey)})),(0,y.tZ)(E,{init:o.lightA,walls:t.groups.walls,hull:t.hullPoly}),(0,y.tZ)(E,{init:o.lightB,walls:t.groups.walls,hull:t.hullPoly})]})})}function E(n){var t=n.init,e=n.walls,o=n.hull,r=c.default.useState((function(){return t})),i=(0,a.Z)(r,2),l=i[0],s=i[1],u=(0,c.useMemo)((function(){if(o[0].clone().removeHoles().contains(l)){var n=e.flatMap((function(n){return f.J.triangulationToPolys(n.fastTriangulate())}));return f.J.lightPolygon({position:l,range:2e3,tris:n})}return new p.LA}),[l.x,l.y]);return(0,y.BX)(y.HY,{children:[(0,y.tZ)("path",{className:"light",d:u.svgPath}),(0,y.tZ)(v.Z,{initial:l,onStop:s,radius:20,stroke:"black",icon:"eye"})]})}var Z=(0,l.iv)(o||(o=(0,r.Z)(["\n  image {\n    filter: contrast(120%);\n  }\n\n  path.light {\n    fill: blue;\n    animation: fadein 2s infinite alternate;\n    \n    @keyframes fadein {\n      from { opacity: 0; }\n      to { opacity: 0.6; }\n    }\n  }\n  &.disabled path.light {\n    animation: none;\n    opacity: 0.25;\n  }\n"])))},35490:function(n,t,e){e.d(t,{l:function(){return r},r:function(){return i}});var o=e(48103),r=new o.UL(-5e3,-5e3,10001,10001),i=new o.UL(0,0,1200,600)},95814:function(n,t,e){e.d(t,{Z:function(){return v}});var o=e(79056),r=e(92809),i=e(97131),a=e(30266),c=e(809),l=e.n(c),s=e(88767),u=e(91441),p=e(48103),d=e(2026),f=e(39660);function g(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,o)}return e}function h(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?g(Object(e),!0).forEach((function(t){(0,r.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):g(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function v(n,t){return(0,s.useQuery)((0,u.tU)(n),(0,a.Z)(l().mark((function t(){var e,r,a,c,s,d,g;return l().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,fetch((0,u.tU)(n)).then((function(n){return n.json()})).then(f.Vn);case 2:return e=t.sent,r=e.roomGraph,a=r.nodesArray.filter((function(n){return"room"===n.type})).map((function(n,t){var o=r.getEdgesFrom(n).flatMap((function(n){var t=n.dst;return"door"===t.type?e.doors[t.doorId].poly:[]}));return p.LA.union([e.rooms[t]].concat((0,i.Z)(o)))[0]})),c=e.groups.singles.filter((function(n){return n.tags.includes("spawn")})).map((function(n){return n.poly.center})),s=e.groups.singles.filter((function(n){return n.tags.includes("switch")})).map((function(n){return n.poly.center})),d=e.groups.singles.filter((function(n){return n.tags.includes("light")})).map((function(n){var t=n.poly.rect;return[t.center,t]})),(g=h(h({},e),{},{hullDoors:e.doors.filter((function(n){return n.tags.includes("hull")})),hullOutline:e.hullPoly[0].removeHoles(),pngRect:p.UL.fromJson(e.items[0].pngRect),roomsWithDoors:a,point:{all:[].concat(d.map((function(n){return n[0]})),c,s),light:d.reduce((function(n,t,r){var i=(0,o.Z)(t,2),a=i[0],c=i[1],l=e.rooms.findIndex((function(n){return n.contains(a)})),s=e.doors.findIndex((function(n){return n.rect.intersects(c)}));return l>=0&&s>=0?(n[l]=n[l]||{})[s]=a:console.warn("useGeomorphData: light ".concat(r," roomId/doorId ").concat(l,"/").concat(s)),n}),{}),spawn:e.rooms.map((function(n){return c.filter((function(t){return n.contains(t)}))})),switch:e.rooms.map((function(n){return s.find((function(t){return n.contains(t)}))||n.rect.center}))},lazy:null})).lazy=m(g),y(g),t.abrupt("return",g);case 12:case"end":return t.stop()}}),t)}))),h({cacheTime:1/0},t))}function m(n){var t={roomNavPoly:{}},e=new Proxy({},{get:function(e,o){if("string"===typeof o){var r=Number(o);if(n.roomsWithDoors[r]&&!t.roomNavPoly[r]){var i=p.LA.intersect(n.navPoly,[n.roomsWithDoors[r]]);i.sort((function(n,t){return n.rect.area>t.rect.area?-1:1})),t.roomNavPoly[r]=i[0]}return t.roomNavPoly[r]}}});return new Proxy(t,{get:function(n,t){if("roomNavPoly"===t)return e}})}function y(n){n.navZone.doorNodeIds.forEach((function(t,e){var o=n.doors[e];if(n.hullDoors.includes(o)){var r,a=o.roomIds.find(Boolean);if(Number.isFinite(a))(r=n.navZone.roomNodeIds[a]).push.apply(r,(0,i.Z)(t));else(0,d.ZK)("extendRoomNodeIds: ".concat(n.key," (hull) door ").concat(e," has empty roomIds"))}}))}},83159:function(n,t,e){e.d(t,{Z:function(){return f}});var o,r=e(52209),i=e(79056),a=e(59748),c=e(88269),l=e(94184),s=e.n(l),u=e(48103),p=e(50269),d=e(8311);function f(n){var t=a.useState((function(){var t=n.initViewBox.clone(),i=n.minZoom||.5,a=n.maxZoom||2;return{viewBox:t,panFrom:null,zoom:n.initZoom||1,ptrs:[],ptrDiff:null,root:{},rootCss:(0,c.iv)(o||(o=(0,r.Z)(["\n        width: 100%;\n        height: 100%;\n\n        touch-action: pan-x pan-y pinch-zoom;\n        background-color: ",";\n\n        > g.content {\n          /** TODO justification? */\n          shape-rendering: ",";\n        }\n        > .grid {\n          pointer-events: none;\n        }\n      "])),n.dark?"#000":"none",(0,p.us)()?"optimizeSpeed":"auto"),onPointerDown:function(n){(0,p.af)(n)&&e.ptrs.length<2&&(e.panFrom=(new u.dl).copy((0,p.zk)((0,p.Xs)(n))),e.ptrs.push((0,p.Xs)(n)))},onPointerMove:function(o){if(e.ptrs=e.ptrs.map((function(n){return n.pointerId===o.pointerId?(0,p.Xs)(o):n})),2===e.ptrs.length){var r=Math.abs(e.ptrs[1].clientX-e.ptrs[0].clientX);if(null!==e.ptrDiff){var i,a=(0,p._Y)(e.ptrs);e.zoomTo(a,.02*(r-e.ptrDiff)),e.root.setAttribute("viewBox","".concat(e.viewBox)),null===(i=n.onUpdate)||void 0===i||i.call(n,e.root)}e.ptrDiff=r}else if(e.panFrom){var c,l=(0,p.zk)((0,p.Xs)(o));t.delta(e.panFrom.x-l.x,e.panFrom.y-l.y),e.root.setAttribute("viewBox","".concat(e.viewBox)),null===(c=n.onUpdate)||void 0===c||c.call(n,e.root)}},onPointerUp:function(n){e.panFrom=null,e.ptrs=e.ptrs.filter((function(t){return n.pointerId!==t.pointerId})),e.ptrs.length<2&&(e.ptrDiff=null),1===e.ptrs.length&&(e.panFrom=(new u.dl).copy((0,p.zk)(e.ptrs[0])))},onTouchStart:function(n){n.preventDefault()},onWheel:function(t){if(t.preventDefault(),(0,p.af)(t)){var o,r=(0,p.zk)((0,p.Xs)(t));e.zoomTo(r,-.003*t.deltaY),e.root.setAttribute("viewBox","".concat(e.viewBox)),null===(o=n.onUpdate)||void 0===o||o.call(n,e.root)}},rootRef:function(n){n&&(e.root=n,n.addEventListener("wheel",e.onWheel,{passive:!1}),n.addEventListener("pointerdown",e.onPointerDown,{passive:!0}),n.addEventListener("pointermove",e.onPointerMove,{passive:!0}),n.addEventListener("pointerup",e.onPointerUp,{passive:!0}),n.addEventListener("pointercancel",e.onPointerUp,{passive:!0}),n.addEventListener("pointerleave",e.onPointerUp,{passive:!0}),n.addEventListener("touchstart",e.onTouchStart,{passive:!1}))},zoomTo:function(o,r){var c=Math.min(Math.max(e.zoom+r,i),a);t.x=e.zoom/c*(t.x-o.x)+o.x,t.y=e.zoom/c*(t.y-o.y)+o.y,t.width=1/c*n.initViewBox.width,t.height=1/c*n.initViewBox.height,e.zoom=c}}})),e=(0,i.Z)(t,1)[0];return(0,d.BX)("svg",{ref:e.rootRef,className:e.rootCss,preserveAspectRatio:"xMinYMin slice",viewBox:"".concat(e.viewBox),children:[(0,d.tZ)("g",{className:s()("content",n.className),children:n.children}),(0,d.tZ)(g,{bounds:n.gridBounds,dark:n.dark})]})}function g(n){var t=a.useMemo((function(){return h++}),[]);return(0,d.tZ)(d.HY,{children:[10,60].flatMap((function(e){return[(0,d.tZ)("defs",{children:(0,d.tZ)("pattern",{id:"pattern-grid-".concat(e,"x").concat(e,"--").concat(t),width:e,height:e,patternUnits:"userSpaceOnUse",children:(0,d.tZ)("path",{d:"M ".concat(e," 0 L 0 0 0 ").concat(e),fill:"none",stroke:n.dark?"rgba(200,200,200,0.2)":"rgba(0,0,0,0.5)",strokeWidth:"0.3"})})}),(0,d.tZ)("rect",{className:"grid",x:n.bounds.x,y:n.bounds.y,width:n.bounds.width,height:n.bounds.height,fill:"url(#pattern-grid-".concat(e,"x").concat(e,"--").concat(t,")")})]}))})}var h=0}}]);