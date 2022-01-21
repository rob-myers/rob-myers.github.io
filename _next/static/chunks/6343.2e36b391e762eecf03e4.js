"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[6343],{16343:function(e,n,t){t.r(n),t.d(n,{default:function(){return C}});var o=t(52209),r=t(92809),i=t(21844),a=t(97131),l=t(79056),c=t(59748),s=t(88269),u=t(35490),d=t(48103),p=t(91441),f=t(83159),g=t(21225),v=t(21416),y=t(96005),m=t(17581);var h,E=24,b=t(50269),P=t(49345),w=t(8311);function k(e){var n=c.default.useState((function(){var n,o={source:new P.d,target:new P.d,dragging:!1,disabled:!0,circleEl:{},lineEl:{},rootRef:function(e){e&&(t.circleEl=e.querySelector("circle.drag-source"),t.lineEl=e.querySelector("line.drag-indicator"),t.circleEl.addEventListener("pointerdown",t.startDrag),t.circleEl.addEventListener("pointerup",t.applyDrag))},startDrag:function(n){var o;if(!t.disabled){n.stopPropagation(),t.dragging=!0,t.lineEl.style.display="inline",["x2","y2"].forEach((function(e){return t.lineEl.setAttribute(e,"0")}));var r=t.lineEl.ownerSVGElement;r.addEventListener("pointermove",t.onMove),r.addEventListener("pointerleave",t.endDrag),r.addEventListener("pointerup",t.applyDrag),window.addEventListener("keydown",t.endDragOnEscape),r.style.cursor="grabbing",t.target.copy(t.source),null===(o=e.onStart)||void 0===o||o.call(e)}},onMove:function(e){if(e.stopPropagation(),t.dragging){var n=(0,b.zk)({clientX:e.clientX,clientY:e.clientY,ownerSvg:t.lineEl.ownerSVGElement,pointerId:null});t.target.copy(n);var o=P.d.from(n).sub(t.source);o.length>=20&&(t.lineEl.setAttribute("x2",String(o.x)),t.lineEl.setAttribute("y2",String(o.y)))}},endDrag:function(){if(t.dragging){t.dragging=!1,t.lineEl.style.display="none",["x2","y2"].forEach((function(e){return t.lineEl.setAttribute(e,"0")}));var e=t.lineEl.ownerSVGElement;e.removeEventListener("pointermove",t.onMove),e.removeEventListener("pointerleave",t.endDrag),e.removeEventListener("pointerup",t.applyDrag),window.removeEventListener("keydown",t.endDragOnEscape),e.style.cursor="auto"}},applyDrag:function(){if(t.dragging){t.endDrag();var n,o=t.source.distanceTo(t.target);if(o<8)null===(n=e.onClick)||void 0===n||n.call(e,t.target.clone());else if(o>20){var r;null===(r=e.onStop)||void 0===r||r.call(e,t.target.clone())}}},endDragOnEscape:function(e){"Escape"===e.key&&t.endDrag()}};return null===(n=e.onLoad)||void 0===n||n.call(e,{disable:function(){t.disabled=!0},enable:function(e){t.source.copy(e),t.disabled=!1}}),o})),t=(0,l.Z)(n,1)[0];return(0,w.BX)("g",{className:N,ref:t.rootRef,children:[(0,w.tZ)("circle",{className:"drag-source",fill:"rgba(0, 0, 0, 0.2)",r:e.radius}),(0,w.tZ)("line",{className:"drag-indicator",stroke:"#444",strokeWidth:2})]})}var x,N=(0,s.iv)(h||(h=(0,o.Z)(["\n  circle {\n    cursor: crosshair;\n  }\n  line {\n    pointer-events: none;\n  }\n"])));function Z(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function D(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?Z(Object(t),!0).forEach((function(n){(0,r.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):Z(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function A(e){var n=c.default.useState((function(){var n=e.defs,o=n.map((function(e){return y.k.getGroup(e.zoneKey,e.src)}));o.forEach((function(e,t){return null===e&&console.warn("NPC: ".concat(n[t].key,": init.src: ").concat(n[t].src.x,", ").concat(n[t].src.y,": no group found"))}));var i=n.map((function(e,n){var t={key:e.key,def:e,el:{npc:{},look:{},path:{}},srcApi:{},dstApi:{},rayApi:{},move:{},look:{},geom:{animPath:[],navPath:[],navPathPolys:[]},aux:{groupId:o[n],count:0,edges:[],elens:[],sofars:[],total:0,angs:[]},getPosition:function(){var e=new DOMMatrixReadOnly(window.getComputedStyle(t.el.npc).transform);return new d.dl(e.m41,e.m42)},is:function(e){return t.move.playState===e},pause:function(){t.is("running")&&(t.move.pause(),t.look.pause())},play:function(){t.move.play(),t.look.play()},internal:null};return t.internal=function(e){var n=e.def,t={followNavPath:function(){var o=e.geom.animPath,r=e.aux;if(!(o.length<=1)){var i=e.is("paused");e.move.cancel(),e.move=e.el.npc.animate(o.map((function(e,n){return{offset:r.total?r.sofars[n]/r.total:0,transform:"translate(".concat(e.x,"px, ").concat(e.y,"px)")}})),{duration:15*r.total,direction:"normal",fill:"forwards"}),e.move.addEventListener("finish",t.onFinishMove),e.look.cancel(),e.look=e.el.look.animate(o.flatMap((function(e,n){return[{offset:r.total?r.sofars[n]/r.total:0,transform:"rotateZ(".concat(r.angs[n-1]||0,"rad)")},{offset:r.total?r.sofars[n]/r.total:0,transform:"rotateZ(".concat(r.angs[n]||r.angs[n-1]||0,"rad)")}]})),{duration:15*r.total,direction:"normal",fill:"forwards"}),e.rayApi.disable(),(i||0===r.count&&n.paused)&&(e.pause(),e.rayApi.enable(e.getPosition())),e.aux.count++}},initialize:function(t){e.el.npc=t.querySelector("g.npc.".concat(n.key)),e.el.look=e.el.npc.querySelector("g.look"),e.el.path=t.querySelector("polyline.navpath.".concat(n.key)),e.move=e.el.npc.animate([{transform:"translate(0px, 0px)"},{transform:"translate(".concat(n.src.x,"px, ").concat(n.src.y,"px)")}],{fill:"forwards"}),e.look=e.el.look.animate([{transform:"rotateZ(0rad)"},{transform:"rotateZ(".concat(n.angle,"rad)")}],{fill:"forwards"})},onDraggedSrcNode:function(){t.updateNavPath(e.srcApi.getPosition()),t.followNavPath()},onClickedSrcNode:function(){if(e.is("finished"))t.reverseNavPath(),e.geom.animPath=e.geom.navPath.slice(),t.updateAnimAux(),t.followNavPath();else if(e.is("paused")){var n=e.getPosition(),o=e.geom.navPathPolys.findIndex((function(e){return e.contains(n)}));if(-1===o)return console.warn("onClickedSrcNode: failed to find npc on its navPath");e.geom.animPath=e.geom.navPath.slice(0,o+1).concat(n).reverse(),t.reverseNavPath(),t.updateAnimAux(),t.followNavPath()}else t.togglePaused()},onDraggedDstNode:function(){t.updateNavPath(e.dstApi.getPosition()),t.followNavPath()},onClickedDstNode:function(){t.togglePaused()},onFinishMove:function(){e.rayApi.enable(e.getPosition())},reverseNavPath:function(){e.geom.navPath.reverse(),e.geom.navPathPolys.reverse(),e.el.path.setAttribute("points","".concat(e.geom.navPath)),t.swapNavNodes()},shouldCancelNavDrag:function(t,o,r){if(null===y.k.getGroup(n.zoneKey,o))return!0;var i=t.distanceTo(o)>=20,a=e.getPosition(),l="src"===r?e.dstApi.getPosition():e.srcApi.getPosition();return i&&(o.distanceTo(a)<=2*E||o.distanceTo(l)<=2*E)},swapNavNodes:function(){var n=[e.srcApi.getPosition(),e.dstApi.getPosition()],t=n[0],o=n[1];e.srcApi.moveTo(o),e.dstApi.moveTo(t)},togglePaused:function(){e.is("finished")||(e.is("paused")?(e.play(),e.rayApi.disable()):(e.pause(),e.rayApi.enable(e.getPosition())))},updateAnimAux:function(){var n=e.geom.animPath,t=e.aux;t.edges=n.map((function(e,t){return{p:e,q:n[t+1]}})).slice(0,-1),t.elens=t.edges.map((function(e){var n=e.p,t=e.q;return n.distanceTo(t)}));var o=t.elens.reduce((function(e,n){return e.total+=n,e.sofars.push(e.sofars[e.sofars.length-1]+n),e}),{sofars:[0],total:0}),r=[o.sofars,o.total];t.sofars=r[0],t.total=r[1],t.angs=t.edges.map((function(e){return Number(Math.atan2(e.q.y-e.p.y,e.q.x-e.p.x).toFixed(2))}))},updateNavPath:function(o){var r,i=y.k.getGroup(n.zoneKey,o);if(null===i)return console.warn("computeNavPath: dst: ".concat(o.x,", ").concat(o.y,": no group found"));if(i!==e.aux.groupId)return console.warn("computeNavPath: (src, dst) have different groupIds: (".concat(e.aux.groupId,", ").concat(i,")"));var a=e.getPosition(),l=(null===(r=y.k.findPath(a,o,n.zoneKey,e.aux.groupId))||void 0===r?void 0:r.path)||[];e.geom.navPath=[d.dl.from(a)].concat(l),e.geom.animPath=e.geom.navPath.slice(),e.srcApi.moveTo(a),e.dstApi.moveTo(o),e.el.path.setAttribute("points","".concat(e.geom.navPath)),t.updateAnimAux(),e.geom.navPathPolys=e.aux.edges.map((function(e){var n=e.q.clone().sub(e.p).rotate(Math.PI/2).normalize(.01);return new d.LA([e.p.clone().add(n),e.q.clone().add(n),e.q.clone().sub(n),e.p.clone().sub(n)])}))}};return t}(t),t})),a={apis:i,for:i.reduce((function(e,n){return D(D({},e),{},(0,r.Z)({},n.key,n))}),{})};return e.onLoad(a),{apis:i,api:a,mounted:!1,rootRef:function(e){e&&!t.mounted&&(t.apis.forEach((function(n){n.internal.initialize(e),n.internal.updateNavPath(d.dl.from(n.def.dst)),n.internal.followNavPath()})),t.mounted=!0)}}})),t=(0,l.Z)(n,1)[0];return(0,w.BX)("g",{className:S,ref:t.rootRef,children:[(0,w.tZ)("g",{className:"navpaths",children:t.apis.map((function(e){return(0,w.BX)("g",{children:[(0,w.tZ)("polyline",{className:"navpath ".concat(e.key)}),(0,w.tZ)(m.Z,{initial:e.def.src,radius:E,onLoad:function(n){return e.srcApi=n},onStop:e.internal.onDraggedSrcNode,shouldCancel:function(n,t){return e.internal.shouldCancelNavDrag(n,t,"src")},onClick:e.internal.onClickedSrcNode},"src"),(0,w.tZ)(m.Z,{initial:e.def.dst,radius:E,onLoad:function(n){return e.dstApi=n},onStop:e.internal.onDraggedDstNode,shouldCancel:function(n,t){return e.internal.shouldCancelNavDrag(n,t,"dst")},onClick:e.internal.onClickedDstNode},"dst")]},e.key)}))}),t.apis.map((function(e){return(0,w.BX)("g",{className:"npc ".concat(e.key),children:[(0,w.tZ)("circle",{className:"body",fill:"#f99",stroke:"black",strokeWidth:2,r:9}),(0,w.tZ)("g",{className:"look",children:(0,w.tZ)("line",{className:"body",stroke:"black",strokeWidth:2,x2:9})}),(0,w.tZ)(k,{radius:9,onLoad:function(n){return e.rayApi=n}})]},e.key)}))]})}var O,S=(0,s.iv)(x||(x=(0,o.Z)(["\n  polyline.navpath {\n    fill: none;\n    stroke: #222;\n    stroke-width: 1;\n    stroke-dasharray: 1px;\n  }\n"])));function L(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);n&&(o=o.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,o)}return t}function j(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?L(Object(t),!0).forEach((function(n){(0,r.Z)(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):L(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function C(e){var n="g-301--bridge",t=c.default.useState((function(){return{defs:[0,1,2].map((function(e){return{key:"npc-".concat(e),src:(0,i.Z)(d.dl,(0,a.Z)([[250,100],[260,200],[40,550]][e])),dst:(0,i.Z)(d.dl,(0,a.Z)([[600,500],[600,340],[1100,50]][e])),zoneKey:n,paused:!1,angle:0}})),api:{},metas:[0,1,2].map((function(e){return{wasPlaying:!1}}))}})),o=(0,l.Z)(t,1)[0],r=(0,g.Z)(n).data,s=(0,v.Z)(n,null===r||void 0===r?void 0:r.navDecomp,e.disabled).data;return c.default.useEffect((function(){s&&(e.disabled?o.api.apis.forEach((function(e,n){o.metas[n].wasPlaying=e.is("running"),e.pause()})):o.api.apis.forEach((function(e,n){return o.metas[n].wasPlaying&&e.play()})))}),[e.disabled,s]),(0,w.tZ)(f.Z,{dark:!0,gridBounds:u.l,initViewBox:T,maxZoom:6,children:(0,w.BX)("g",{className:q,children:[r&&(0,w.tZ)("image",j(j({},r.pngRect),{},{className:"geomorph",href:(0,p.qX)(n)})),(0,w.tZ)("g",{className:"navtris",children:!e.disabled&&(null===s||void 0===s?void 0:s.zone.groups.map((function(e){return e.map((function(e){var n=e.vertexIds;return(0,w.tZ)("polygon",{className:"navtri",points:"".concat(n.map((function(e){return s.zone.vertices[e]})))})}))})))}),s&&(0,w.tZ)(A,{defs:o.defs,onLoad:function(e){return o.api=e}})]})})}var q=(0,s.iv)(O||(O=(0,o.Z)(["\n  border: 1px solid #555555;\n  height: inherit;\n\n  image {\n    /* filter: invert(100%) sepia(50%); */\n    /* filter: invert(100%); */\n  }\n\n  polygon.navtri {\n    fill: transparent;\n    &:hover {\n      fill: rgba(0, 0, 0, 0.03);\n      stroke: black;\n    }\n  }\n"]))),T=new d.UL(200,0,800,800)},17581:function(e,n,t){t.d(n,{Z:function(){return p}});var o,r=t(52209),i=t(79056),a=t(59748),l=t(88269),c=t(48103),s=t(50269),u=t(27375),d=t(8311);function p(e){var n=(0,u.Z)(),t=a.default.useState((function(){var t,r={position:c.dl.from(e.initial),target:c.dl.from(e.initial),dragging:!1,rootEl:{},lineEl:{},circleEl:{},rootRef:function(e){e&&(o.rootEl=e,o.lineEl=e.querySelector("line.drag-indicator"),o.circleEl=e.querySelector("circle.node"),o.circleEl.addEventListener("pointerdown",o.startDrag),o.circleEl.addEventListener("pointerup",o.applyDrag))},startDrag:function(n){var t;n.stopPropagation(),o.dragging=!0,o.lineEl.style.display="inline",o.target.copy(o.position),["x1","x2"].forEach((function(e){return o.lineEl.setAttribute(e,String(o.position.x))})),["y1","y2"].forEach((function(e){return o.lineEl.setAttribute(e,String(o.position.y))}));var r=o.lineEl.ownerSVGElement;r.addEventListener("pointermove",o.onMove),r.addEventListener("pointerleave",o.endDrag),r.addEventListener("pointerup",o.applyDrag),window.addEventListener("keydown",o.endDragOnEscape),r.style.cursor="grabbing",null===(t=e.onStart)||void 0===t||t.call(e)},onMove:function(e){if(e.stopPropagation(),o.dragging){var n=(0,s.zk)({clientX:e.clientX,clientY:e.clientY,ownerSvg:o.lineEl.ownerSVGElement,pointerId:null}),t=n.x,r=n.y,i=new c.dl(t,r);o.position.distanceTo(i)>=20&&(o.target.set(t,r),o.lineEl.setAttribute("x2",String(t)),o.lineEl.setAttribute("y2",String(r)))}},endDrag:function(){if(o.dragging){o.dragging=!1,o.lineEl.style.display="none",o.lineEl.setAttribute("x2",o.lineEl.getAttribute("x1")),o.lineEl.setAttribute("y2",o.lineEl.getAttribute("y1"));var e=o.lineEl.ownerSVGElement;e.removeEventListener("pointermove",o.onMove),e.removeEventListener("pointerleave",o.endDrag),e.removeEventListener("pointerup",o.applyDrag),window.removeEventListener("keydown",o.endDragOnEscape),e.style.cursor="auto"}},applyDrag:function(){var n,t,r;o.dragging&&(o.endDrag(),null!==(n=e.shouldCancel)&&void 0!==n&&n.call(e,o.position.clone(),o.target.clone())||(o.target.distanceTo(o.position)<20?null===(t=e.onClick)||void 0===t||t.call(e,o.position.clone()):(o.moveTo(o.target),null===(r=e.onStop)||void 0===r||r.call(e,o.target.clone()))))},endDragOnEscape:function(e){"Escape"===e.key&&o.endDrag()},moveTo:function(e){o.position.copy(e),o.lineEl.setAttribute("x1",String(o.target.x)),o.lineEl.setAttribute("y1",String(o.target.y)),n()}};return null===(t=e.onLoad)||void 0===t||t.call(e,{moveTo:r.moveTo,getPosition:function(){return o.position.clone()}}),r})),o=(0,i.Z)(t,1)[0],r=e.radius||8;return(0,d.BX)("g",{className:f,ref:o.rootRef,children:[e.icon&&{eye:(0,d.tZ)("image",{href:"/icon/Simple_Icon_Eye.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),down:(0,d.tZ)("image",{href:"/icon/solid_arrow-circle-down.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),right:(0,d.tZ)("image",{href:"/icon/solid_arrow-circle-right.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),run:(0,d.tZ)("image",{href:"/icon/person-running-fa6.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10}),finish:(0,d.tZ)("image",{href:"/icon/flag-checkered-fa6.svg",width:"20",height:"20",x:o.position.x-10,y:o.position.y-10})}[e.icon]||(0,d.tZ)("circle",{className:"inner-node",cx:o.position.x,cy:o.position.y,r:4}),(0,d.tZ)("circle",{className:"node",cx:o.position.x,cy:o.position.y,r:r}),(0,d.tZ)("line",{className:"drag-indicator",stroke:e.stroke||"blue"})]})}var f=(0,l.iv)(o||(o=(0,r.Z)(["\n  circle.node {\n    fill: rgba(0, 0, 100, 0.1);\n    stroke: rgba(0, 0, 100, 0.2);\n    stroke-dasharray: 4px 4px;\n    cursor: pointer;\n  }\n  circle.inner-node {\n    stroke: black;\n    cursor: pointer;\n    stroke-width: 0.5;\n  }\n  line.drag-indicator {\n    display: none;\n    stroke-width: 2.5;\n    user-select: none;\n    pointer-events: none;\n  }\n"])))},21844:function(e,n,t){t.d(n,{Z:function(){return i}});var o=t(36129);function r(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}function i(e,n,t){return(i=r()?Reflect.construct:function(e,n,t){var r=[null];r.push.apply(r,n);var i=new(Function.bind.apply(e,r));return t&&(0,o.Z)(i,t.prototype),i}).apply(null,arguments)}},36129:function(e,n,t){function o(e,n){return(o=Object.setPrototypeOf||function(e,n){return e.__proto__=n,e})(e,n)}t.d(n,{Z:function(){return o}})}}]);