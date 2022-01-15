"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5753],{15753:function(n,t,e){e.r(t),e.d(t,{default:function(){return A}});var o,i=e(52209),r=e(92809),a=e(21844),c=e(97131),s=e(79056),l=e(59748),u=e(88269),d=e(35490),p=e(48103),f=e(91441),g=e(83159),v=e(21225),h=e(21416),m=e(49345),y=e(96005),P=e(17581),x=e(8311);function w(n){var t=l.default.useState((function(){var t=y.k.getGroup(n.init.zoneKey,n.init.src);null===t&&console.warn("NPC: init.src: ".concat(n.init.src.x,", ").concat(n.init.src.y,": no group found"));var o={anim:{},geom:{animPath:[],navPath:[],navPathPolys:[]},aux:{groupId:t,count:0,edges:[],elens:[],sofars:[],total:0,angs:[]},getPosition:function(){var n=new DOMMatrixReadOnly(window.getComputedStyle(e.el.npc).transform);return new m.d(n.m41,n.m42)},is:function(n){return e.api.anim.playState===n}};return n.onLoad(o),{el:{npc:{},path:{}},mounted:!1,srcApi:{},dstApi:{},api:o,shouldCancelDrag:function(t,o,i){if(null===y.k.getGroup(n.init.zoneKey,o))return!0;var r=t.distanceTo(o)>=20,a=e.api.getPosition(),c="src"===i?e.dstApi.getPosition():e.srcApi.getPosition();return r&&(o.distanceTo(a)<=2*b||o.distanceTo(c)<=2*b)},followNavPath:function(){var t=o.geom.animPath,i=o.aux;if(!(t.length<=1)){var r=o.is("paused");o.anim.cancel(),o.anim=e.el.npc.animate(t.flatMap((function(n,t){return[{offset:i.total?i.sofars[t]/i.total:0,transform:"translate(".concat(n.x,"px, ").concat(n.y,"px) rotateZ(").concat(i.angs[t-1]||0,"rad)")},{offset:i.total?i.sofars[t]/i.total:0,transform:"translate(".concat(n.x,"px, ").concat(n.y,"px) rotateZ(").concat(i.angs[t]||i.angs[t-1]||0,"rad)")}]})),{duration:15*i.total,direction:"normal",fill:"forwards"}),(r||0===i.count&&n.init.paused)&&o.anim.pause(),o.aux.count++}},onDraggedSrcNode:function(){e.updateNavPath(e.srcApi.getPosition()),e.followNavPath()},onClickedSrcNode:function(){if(o.is("finished"))e.reverseNavPath(),o.geom.animPath=o.geom.navPath.slice(),e.updateAnimAux(),e.followNavPath();else if(o.is("paused")){var n=o.getPosition(),t=o.geom.navPathPolys.findIndex((function(t){return t.contains(n)}));if(-1===t)return console.warn("onClickedSrcNode: failed to find npc on its navPath");o.geom.animPath=o.geom.navPath.slice(0,t+1).concat(n).reverse(),e.reverseNavPath(),e.updateAnimAux(),e.followNavPath()}else e.togglePaused()},onDraggedDstNode:function(){e.updateNavPath(e.dstApi.getPosition()),e.followNavPath()},onClickedDstNode:function(){e.togglePaused()},reverseNavPath:function(){o.geom.navPath.reverse(),o.geom.navPathPolys.reverse(),e.el.path.setAttribute("points","".concat(o.geom.navPath)),e.swapNodes()},rootRef:function(t){t&&!e.mounted&&(e.el.npc=t.querySelector("g.npc"),e.el.path=t.querySelector("polyline.navpath"),o.anim=e.el.npc.animate([{transform:"translate(0px, 0px)"},{transform:"translate(".concat(n.init.src.x,"px, ").concat(n.init.src.y,"px)")}],{fill:"forwards"}),e.mounted=!0)},swapNodes:function(){var n=[e.srcApi.getPosition(),e.dstApi.getPosition()],t=n[0],o=n[1];e.srcApi.moveTo(o),e.dstApi.moveTo(t)},togglePaused:function(){o.is("finished")||(o.is("paused")?e.api.anim.play():e.api.anim.pause())},updateAnimAux:function(){var n=o.geom.animPath,t=o.aux;t.edges=n.map((function(t,e){return{p:t,q:n[e+1]}})).slice(0,-1),t.elens=t.edges.map((function(n){var t=n.p,e=n.q;return t.distanceTo(e)}));var e=t.elens.reduce((function(n,t){return n.total+=t,n.sofars.push(n.sofars[n.sofars.length-1]+t),n}),{sofars:[0],total:0}),i=[e.sofars,e.total];t.sofars=i[0],t.total=i[1],t.angs=t.edges.map((function(n){return Number(Math.atan2(n.q.y-n.p.y,n.q.x-n.p.x).toFixed(2))}))},updateNavPath:function(t){var i,r=y.k.getGroup(n.init.zoneKey,t);if(null===r)return console.warn("computeNavPath: dst: ".concat(t.x,", ").concat(t.y,": no group found"));if(r!==o.aux.groupId)return console.warn("computeNavPath: (src, dst) have different groupIds: (".concat(o.aux.groupId,", ").concat(r,")"));var a=o.getPosition(),c=(null===(i=y.k.findPath(a,t,n.init.zoneKey,o.aux.groupId))||void 0===i?void 0:i.path)||[];o.geom.navPath=[m.d.from(a)].concat(c),o.geom.animPath=o.geom.navPath.slice(),e.srcApi.moveTo(a),e.dstApi.moveTo(t),e.el.path.setAttribute("points","".concat(o.geom.navPath)),e.updateAnimAux(),o.geom.navPathPolys=o.aux.edges.map((function(n){var t=n.q.clone().sub(n.p).rotate(Math.PI/2).normalize(.01);return new p.LA([n.p.clone().add(t),n.q.clone().add(t),n.q.clone().sub(t),n.p.clone().sub(t)])}))}}})),e=(0,s.Z)(t,1)[0];return l.default.useLayoutEffect((function(){0===e.api.aux.count&&(e.updateNavPath(m.d.from(n.init.dst)),e.followNavPath())}),[]),(0,x.BX)("g",{className:k,ref:e.rootRef,children:[(0,x.BX)("g",{children:[(0,x.tZ)("polyline",{className:"navpath"}),(0,x.tZ)(P.Z,{initial:n.init.src,radius:b,onLoad:function(n){return e.srcApi=n},onStop:e.onDraggedSrcNode,shouldCancel:function(n,t){return e.shouldCancelDrag(n,t,"src")},onClick:e.onClickedSrcNode}),(0,x.tZ)(P.Z,{initial:n.init.dst,radius:b,onLoad:function(n){return e.dstApi=n},onStop:e.onDraggedDstNode,shouldCancel:function(n,t){return e.shouldCancelDrag(n,t,"dst")},onClick:e.onClickedDstNode})]}),(0,x.BX)("g",{className:"npc",children:[(0,x.tZ)("circle",{fill:"#f99",stroke:"black",strokeWidth:2,r:9}),(0,x.tZ)("line",{stroke:"black",strokeWidth:2,x2:9})]})]})}var E,b=24,k=(0,u.iv)(o||(o=(0,i.Z)(["\n  polyline.navpath {\n    fill: none;\n    stroke: #304075;\n    stroke-width: 2;\n    stroke-dasharray: 2px 4px;\n    stroke-dashoffset: 0px;\n  }\n\n  g.npc {\n    pointer-events: none;\n  }\n"])));function Z(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,o)}return e}function N(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?Z(Object(e),!0).forEach((function(t){(0,r.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):Z(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function A(n){var t="g-301--bridge",e=l.default.useState((function(){return{npcs:[0,1,2].map((function(n){return{init:{src:(0,a.Z)(p.dl,(0,c.Z)([[250,100],[260,200],[40,550]][n])),dst:(0,a.Z)(p.dl,(0,c.Z)([[600,500],[600,340],[1100,50]][n])),zoneKey:t,paused:!1},api:{},wasPlaying:!1}}))}})),o=(0,s.Z)(e,1)[0],i=(0,v.Z)(t).data,r=(0,h.Z)(t,null===i||void 0===i?void 0:i.navDecomp,n.disabled).data;return l.default.useEffect((function(){r&&(n.disabled?o.npcs.forEach((function(n){n.wasPlaying=n.api.is("running"),n.api.anim.pause()})):o.npcs.forEach((function(n){return n.wasPlaying&&n.api.anim.play()})))}),[n.disabled,r]),(0,x.tZ)(g.Z,{dark:!0,gridBounds:d.l,initViewBox:S,maxZoom:6,children:(0,x.BX)("g",{className:D,children:[i&&(0,x.tZ)("image",N(N({},i.pngRect),{},{className:"geomorph",href:(0,f.qX)(t)})),null===r||void 0===r?void 0:r.zone.groups.map((function(n){return n.map((function(n){var t=n.vertexIds;return(0,x.tZ)("polygon",{className:"navtri",points:"".concat(t.map((function(n){return r.zone.vertices[n]})))})}))})),r&&o.npcs.map((function(n){return(0,x.tZ)(w,{init:n.init,onLoad:function(t){return n.api=t}})}))]})})}var D=(0,u.iv)(E||(E=(0,i.Z)(["\n  border: 1px solid #555555;\n  height: inherit;\n\n  /* image {\n    filter: invert(100%) sepia(50%);\n  } */\n\n  polygon.navtri {\n    fill: transparent;\n    &:hover {\n      fill: rgba(0, 0, 0, 0.03);\n      stroke: black;\n    }\n  }\n"]))),S=new p.UL(200,0,800,800)},17581:function(n,t,e){e.d(t,{Z:function(){return p}});var o,i=e(52209),r=e(79056),a=e(88269),c=e(59748),s=e(48103),l=e(50269),u=e(27375),d=e(8311);function p(n){var t=(0,u.Z)(),e=c.default.useState((function(){return{position:s.dl.from(n.initial),target:s.dl.from(n.initial),dragging:!1,rootEl:{},lineEl:{},circleEl:{},startDrag:function(t){var e;t.stopPropagation(),o.dragging=!0,o.lineEl.style.display="inline",o.target.copy(o.position),["x1","x2"].forEach((function(n){return o.lineEl.setAttribute(n,String(o.position.x))})),["y1","y2"].forEach((function(n){return o.lineEl.setAttribute(n,String(o.position.y))}));var i=o.lineEl.ownerSVGElement;i.addEventListener("pointermove",o.onMove),i.addEventListener("pointerleave",o.endDrag),i.addEventListener("pointerup",o.applyDrag),window.addEventListener("keydown",o.endDragOnEscape),i.style.cursor="grabbing",null===(e=n.onStart)||void 0===e||e.call(n)},onMove:function(n){if(n.stopPropagation(),o.dragging){var t=(0,l.zk)({clientX:n.clientX,clientY:n.clientY,ownerSvg:o.lineEl.ownerSVGElement,pointerId:null}),e=t.x,i=t.y,r=new s.dl(e,i);o.position.distanceTo(r)>=20&&(o.target.set(e,i),o.lineEl.setAttribute("x2",String(e)),o.lineEl.setAttribute("y2",String(i)))}},endDrag:function(){if(o.dragging){o.dragging=!1,o.lineEl.style.display="none",o.lineEl.setAttribute("x2",o.lineEl.getAttribute("x1")),o.lineEl.setAttribute("y2",o.lineEl.getAttribute("y1"));var n=o.lineEl.ownerSVGElement;n.removeEventListener("pointermove",o.onMove),n.removeEventListener("pointerleave",o.endDrag),n.removeEventListener("pointerup",o.applyDrag),window.removeEventListener("keydown",o.endDragOnEscape),n.style.cursor="auto"}},applyDrag:function(){var t,e,i;o.dragging&&(o.endDrag(),null!==(t=n.shouldCancel)&&void 0!==t&&t.call(n,o.position.clone(),o.target.clone())||(o.target.distanceTo(o.position)<20?null===(e=n.onClick)||void 0===e||e.call(n,o.position.clone()):(o.moveTo(o.target),null===(i=n.onStop)||void 0===i||i.call(n,o.target.clone()))))},endDragOnEscape:function(n){"Escape"===n.key&&o.endDrag()},moveTo:function(n){o.position.copy(n),o.lineEl.setAttribute("x1",String(o.target.x)),o.lineEl.setAttribute("y1",String(o.target.y)),t()}}})),o=(0,r.Z)(e,1)[0];c.default.useLayoutEffect((function(){var t;null===(t=n.onLoad)||void 0===t||t.call(n,{moveTo:o.moveTo,getPosition:function(){return o.position.clone()}})}),[]);var i=n.radius||8;return(0,d.BX)("g",{className:f,ref:function(n){n&&(o.rootEl=n,o.lineEl=n.querySelector("line.drag-indicator"),o.circleEl=n.querySelector("circle.node"),o.circleEl.addEventListener("pointerdown",o.startDrag),o.circleEl.addEventListener("pointerup",o.applyDrag))},children:[n.icon&&{eye:(0,d.tZ)("image",{href:"/icon/Simple_Icon_Eye.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),down:(0,d.tZ)("image",{href:"/icon/solid_arrow-circle-down.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),right:(0,d.tZ)("image",{href:"/icon/solid_arrow-circle-right.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),run:(0,d.tZ)("image",{href:"/icon/person-running-fa6.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),finish:(0,d.tZ)("image",{href:"/icon/flag-checkered-fa6.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10})}[n.icon]||(0,d.tZ)("circle",{className:"inner-node",cx:o.position.x,cy:o.position.y,r:4}),(0,d.tZ)("circle",{className:"node",cx:o.position.x,cy:o.position.y,r:i}),(0,d.tZ)("line",{className:"drag-indicator",stroke:n.stroke||"blue"})]})}var f=(0,a.iv)(o||(o=(0,i.Z)(["\n  circle.node {\n    fill: rgba(0, 0, 100, 0.1);\n    stroke: rgba(0, 0, 100, 0.2);\n    cursor: pointer;\n  }\n  circle.inner-node {\n    stroke: black;\n    cursor: pointer;\n    stroke-width: 0.5;\n  }\n  line.drag-indicator {\n    display: none;\n    stroke-width: 2.5;\n    user-select: none;\n    pointer-events: none;\n  }\n"])))},21844:function(n,t,e){e.d(t,{Z:function(){return r}});var o=e(36129);function i(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(n){return!1}}function r(n,t,e){return(r=i()?Reflect.construct:function(n,t,e){var i=[null];i.push.apply(i,t);var r=new(Function.bind.apply(n,i));return e&&(0,o.Z)(r,e.prototype),r}).apply(null,arguments)}},36129:function(n,t,e){function o(n,t){return(o=Object.setPrototypeOf||function(n,t){return n.__proto__=t,n})(n,t)}e.d(t,{Z:function(){return o}})}}]);