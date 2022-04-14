"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[222],{30245:function(t,n,e){e.d(n,{Z:function(){return v}});var r,o=e(52209),i=e(92809),a=e(59748),c=e(88269),u=e(94184),s=e.n(u),l=e(84175),d=e(50269),p=e(44275),f=e(27375),g=e(8311);function m(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),e.push.apply(e,r)}return e}function h(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?m(Object(e),!0).forEach((function(n){(0,i.Z)(t,n,e[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):m(Object(e)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))}))}return t}function v(t){var n=(0,f.Z)(),e=(0,p.Z)((function(){var r={get ready(){return!0},getVisible:function(t){return Object.keys(e.vis[t]).map(Number)},getOpen:function(t){return Object.keys(e.open[t]).map(Number)},setVisible:function(t,r){e.vis[t]=r.reduce((function(t,n){return h(h({},t),{},(0,i.Z)({},n,!0))}),{}),e.drawInvisibleInCanvas(t),n()}};return h({canvas:[],open:t.gms.map((function(t){return{}})),vis:t.gms.map((function(t){return{}})),rootEl:{},onToggleDoor:function(n){var r=Number(n.target.getAttribute("data-gm-index")),o=Number(n.target.getAttribute("data-door-index")),i=Number(n.target.getAttribute("data-hull-door-index"));if(e.vis[r][o]){var a=-1!==i?t.gmGraph.getAdjacentHoleCtxt(r,i):null;e.open[r][o]?(delete e.open[r][o],a&&delete e.open[a.adjGmId][a.adjDoorId]):(e.open[r][o]=!0,a&&(e.open[a.adjGmId][a.adjDoorId]=!0));var c=e.open[r][o]?"opened-door":"closed-door";t.wire.next({gmIndex:r,index:o,key:c}),a&&t.wire.next({gmIndex:a.adjGmId,index:a.adjDoorId,key:c}),e.drawInvisibleInCanvas(r)}},drawInvisibleInCanvas:function(n){var r=e.canvas[n],o=(0,l.Cq)(r.getContext("2d"));o.clearRect(0,0,r.width,r.height),o.fillStyle="#555",o.strokeStyle="#00204b",t.gms[n].doors.forEach((function(t,r){var i=t.poly;e.vis[n][r]||((0,d.Fx)(o,[i]),o.stroke())}))}},r)}));return a.default.useEffect((function(){t.onLoad(e)}),[]),a.default.useEffect((function(){return t.gms.forEach((function(t,n){return e.drawInvisibleInCanvas(n)})),e.rootEl.addEventListener("pointerup",e.onToggleDoor),function(){e.rootEl.removeEventListener("pointerup",e.onToggleDoor)}}),[t.gms]),(0,g.tZ)("div",{ref:function(t){return t&&(e.rootEl=t)},className:s()("doors",y),children:t.gms.map((function(t,n){return(0,g.BX)("div",{style:{transform:t.transformStyle},children:[t.doors.map((function(r,o){return e.vis[n][o]&&(0,g.tZ)("div",{className:s()("door",{open:e.open[n][o],iris:r.tags.includes("iris")}),style:{left:r.rect.x,top:r.rect.y,width:r.rect.width,height:r.rect.height,transform:"rotate(".concat(r.angle,"rad)"),transformOrigin:"top left"},children:(0,g.tZ)("div",{className:"door-touch-ui","data-gm-index":n,"data-door-index":o,"data-hull-door-index":t.hullDoors.indexOf(r)})},o)})),(0,g.tZ)("canvas",{ref:function(t){return t&&(e.canvas[n]=t)},width:t.pngRect.width,height:t.pngRect.height})]},t.itemKey)}))})}var y=(0,c.iv)(r||(r=(0,o.Z)(["\n  position: absolute;\n\n  canvas {\n    position: absolute;\n    pointer-events: none;\n  }\n\n  div.door {\n    position: absolute;\n    pointer-events: none;\n    \n    .door-touch-ui {\n      cursor: pointer;\n      pointer-events: all;\n      position: absolute;\n      left: calc(50% - ","px);\n      top: calc(50% - ","px);\n      width: ","px;\n      height: 20px;\n      background: rgba(100, 0, 0, 0.1);\n      border-radius: ","px;\n    }\n\n    &:not(.iris) {\n      background: #fff;\n      border: 1px solid #555;\n\n      transition: width 300ms ease-in;\n      &.open {\n        width: 10px !important;\n      }\n    }\n\n    &.iris {\n      background-image: linear-gradient(45deg, #888 33.33%, #333 33.33%, #333 50%, #888 50%, #888 83.33%, #333 83.33%, #333 100%);\n      background-size: 4.24px 4.24px;\n      border: 1px solid #fff;\n      \n      opacity: 1;\n      transition: opacity 300ms ease;\n      &.open {\n        opacity: 0.2;\n      }\n    }\n  }\n"])),20,10,40,10)},77102:function(t,n,e){e.d(n,{C:function(){return v}});var r=e(79056),o=e(97131),i=e(68216),a=e(25997),c=e(14695),u=e(91077),s=e(30268),l=e(92953),d=e(92809),p=e(48103),f=e(82405),g=e(68451),m=e(60168);function h(t){var n=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var e,r=(0,l.Z)(t);if(n){var o=(0,l.Z)(this).constructor;e=Reflect.construct(r,arguments,o)}else e=r.apply(this,arguments);return(0,s.Z)(this,e)}}var v=function(t){(0,u.Z)(e,t);var n=h(e);function e(t){var r;return(0,i.Z)(this,e),r=n.call(this),(0,d.Z)((0,c.Z)(r),"gms",void 0),r.gms=t,r}return(0,a.Z)(e,[{key:"getAdjacentHoleCtxt",value:function(t,n){var e=this.gms[t],r=this.getNodeById(y(e.key,e.transform)),o=this.getNodeById(b(e.key,e.transform,n));if(!o)return console.warn("GmGraph: failed to find hull door node: ".concat(b(e.key,e.transform,n))),null;var i=this.getSuccs(o).filter((function(t){return t!==r}))[0];if(!i)return console.info("GmGraph: hull door on boundary",o),null;var a=i.gmIndex,c=i.hullDoorId,u=i.doorId;return{adjGmId:a,adjHoleId:this.gms[a].hullDoors[c].holeIds.find((function(t){return"number"===typeof t})),adjHullId:c,adjDoorId:u}}},{key:"getOpenDoorArea",value:function(t,n){var e=this.gms[t],r=e.doors[n],o=e.hullDoors.indexOf(r);if(-1===o){var i=e.roomGraph.getAdjacentRooms(e.roomGraph.getDoorNode(n));return{gmIndex:t,doorIndex:n,adjHoleId:null,poly:p.LA.union(i.map((function(t){return e.holesWithDoors[t.holeIndex]})))[0]}}var a=this.getAdjacentHoleCtxt(t,o);if(a){var c=r.holeIds.find((function(t){return"number"===typeof t})),u=this.gms[a.adjGmId],s=p.LA.union([e.holesWithDoors[c].clone().applyMatrix(e.matrix).applyMatrix(u.inverseMatrix),u.holesWithDoors[a.adjHoleId]])[0];return{gmIndex:a.adjGmId,doorIndex:a.adjDoorId,adjHoleId:a.adjHoleId,poly:s}}return console.error("GmGraph: getOpenDoorArea: failed to get context",{gmIndex:t,doorIndex:n,hullDoorIndex:o}),null}},{key:"getOpenWindowPolygon",value:function(t,n){var e=this.gms[t],r=e.windows[n],o=e.roomGraph.getAdjacentRooms(e.roomGraph.getWindowNode(n));return p.LA.union(o.map((function(t){return e.holes[t.holeIndex]})).concat(r.poly))[0]}},{key:"computeLightPolygons",value:function(t,n,e){var r=this,i=this.gms[t],a=i.roomGraph.nodesArray[n],c=i.roomGraph.getAdjacentDoors(a).map((function(t){return t.doorIndex})).filter((function(t){return e.includes(t)})).flatMap((function(n){return r.getOpenDoorArea(t,n)||[]})).map((function(t){var e,o=r.gms[t.gmIndex].doors,i=o.filter((function(n,e){return e!==t.doorIndex})).map((function(t){return t.seg}));return{gmIndex:t.gmIndex,poly:g.J.lightPolygon({position:(0,m.AR)(o[t.doorIndex],null!==(e=t.adjHoleId)&&void 0!==e?e:n),range:1e3,exterior:t.poly,extraSegs:i})}})),u=i.roomGraph.getAdjacentWindows(a).map((function(t){return t.windowIndex})).map((function(e){return{gmIndex:t,poly:g.J.lightPolygon({position:(0,m.AR)(i.windows[e],n),range:1e3,exterior:r.getOpenWindowPolygon(t,e)})}}));return[].concat((0,o.Z)(c),(0,o.Z)(u))}},{key:"fromGmItems",value:function(t){var n=this;this.gms=t;var e=[].concat((0,o.Z)(t.map((function(t,n){return{type:"gm",gmKey:t.key,gmIndex:n,id:y(t.key,t.transform),transform:t.transform}}))),(0,o.Z)(t.flatMap((function(t,n){var e=t.key,r=t.hullDoors,o=t.transform,i=t.pngRect,a=t.doors;return r.map((function(t,r){var c=t.poly.center.addScaledVector(t.normal,20),u=i.contains(c);return{type:"door",gmKey:e,gmIndex:n,id:b(e,o,r),doorId:a.indexOf(t),hullDoorId:r,transform:o,gmInFront:u}}))}))));this.registerNodes(e);var i=t.flatMap((function(t){var n=t.key,e=t.hullDoors,r=t.transform,o=y(n,r);return e.map((function(t,e){return{src:o,dst:b(n,r,e)}}))})),a=t.flatMap((function(n,e){var o=t.filter((function(t,r){return r!==e&&t.gridRect.intersects(n.gridRect)})),i=new p.UL,a=new p.UL,c=new p._3,u=new p._3;return n.hullDoors.flatMap((function(t,e){var s=b(n.key,n.transform,e);c.setMatrixValue(n.transform),i.copy(t.poly.rect.applyMatrix(c));var l=o.flatMap((function(t){return t.hullDoors.map((function(n){return[t,n]}))})).find((function(t){var n=(0,r.Z)(t,2),e=n[0].transform,o=n[1].poly;return i.intersects(a.copy(o.rect.applyMatrix(u.setMatrixValue(e))))}));if(void 0!==l){var d=(0,r.Z)(l,2),p=d[0],f=d[1],g=p.hullDoors.indexOf(f);return{src:s,dst:b(p.key,p.transform,g)}}return[]}))}));return[].concat((0,o.Z)(i),(0,o.Z)(a)).forEach((function(t){var e=t.src,r=t.dst;e&&r&&(n.connect({src:e,dst:r}),n.connect({src:r,dst:e}))})),this}}],[{key:"fromGmItems",value:function(t){return new e([]).fromGmItems(t)}}]),e}(f.b);function y(t,n){return"gm-".concat(t,"-[").concat(n,"]")}function b(t,n,e){return"door-".concat(t,"-[").concat(n,"]-").concat(e)}},95814:function(t,n,e){e.d(n,{Z:function(){return g}});var r=e(92809),o=e(97131),i=e(30266),a=e(809),c=e.n(a),u=e(88767),s=e(91441),l=e(48103),d=e(60168);function p(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable}))),e.push.apply(e,r)}return e}function f(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?p(Object(e),!0).forEach((function(n){(0,r.Z)(t,n,e[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):p(Object(e)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))}))}return t}function g(t,n){return(0,u.useQuery)((0,s.tU)(t),(0,i.Z)(c().mark((function n(){var e,r,i,a,u,p;return c().wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return n.next=2,fetch((0,s.tU)(t)).then((function(t){return t.json()})).then(d.Vn);case 2:return e=n.sent,r=e.roomGraph,i=r.nodesArray.filter((function(t){return"room"===t.type})).map((function(t,n){var i=r.getEdgesFrom(t).flatMap((function(t){var n=t.dst;return"door"===n.type?e.doors[n.doorIndex].poly:[]}));return l.LA.union([e.holes[n]].concat((0,o.Z)(i)))[0]})),a=e.groups.singles.filter((function(t){return t.tags.includes("switch")})).map((function(t){return t.poly.center})),u=e.groups.singles.filter((function(t){return t.tags.includes("spawn")})).map((function(t){return t.poly.center})),p=f(f({},e),{},{holesWithDoors:i,holeSwitches:e.holes.map((function(t){return a.find((function(n){return t.contains(n)}))||t.rect.center})),hullDoors:e.doors.filter((function(t){return t.tags.includes("hull")})),hullOutline:e.hullPoly[0].removeHoles(),pngRect:l.UL.fromJson(e.items[0].pngRect),spawnPoints:u}),n.abrupt("return",p);case 9:case"end":return n.stop()}}),n)}))),f({cacheTime:1/0},n))}},43314:function(t,n,e){e.d(n,{Z:function(){return l}});var r=e(97131),o=e(79056),i=e(59748),a=e(84175),c=e(77102),u=e(60168),s=e(95814);function l(t){var n=i.default.useState((function(){return t.map((function(t){return t.layoutKey}))})),e=(0,o.Z)(n,2),l=e[0],d=e[1];i.default.useEffect((function(){var n=t.map((function(t){return t.layoutKey})).filter((function(t){return!l.includes(t)}));n.length&&d([].concat((0,r.Z)(l),(0,r.Z)(n)))}),[l]);var p=l.map((function(t){return(0,s.Z)(t,{staleTime:1/0})})),f=t.every((function(t){return l.includes(t.layoutKey)}))&&p.every((function(t){return t.data}));return i.default.useMemo((function(){if(f){var n=t.map((function(t){var n=l.findIndex((function(n){return n===t.layoutKey})),e=(0,a.Nh)(p[n].data),r=t.transform||[1,0,0,1,0,0];return(0,u.mI)(e,r)}));return{gms:n,gmGraph:c.C.fromGmItems(n)}}return{gms:[],gmGraph:new c.C([])}}),[f])}},44275:function(t,n,e){e.d(n,{Z:function(){return a}});var r=e(79056),o=e(59748),i=e(84175);function a(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},e=o.default.useState(t),a=(0,r.Z)(e,1),c=a[0];return o.default.useMemo((function(){var e=t.toString()!==c._prevFn;if(c._prevFn)if(e){for(var o=t(),a=0,u=Object.entries(o);a<u.length;a++){var s,l,d,p=(0,r.Z)(u[a],2),f=p[0],g=p[1],m=f;if("function"===typeof g)c[m]=g;else if(null!==(s=Object.getOwnPropertyDescriptor(c,m))&&void 0!==s&&s.get||null!==(l=Object.getOwnPropertyDescriptor(c,m))&&void 0!==l&&l.set){var h,v;Object.defineProperty(c,m,{get:null===(h=Object.getOwnPropertyDescriptor(o,m))||void 0===h?void 0:h.get,set:null===(v=Object.getOwnPropertyDescriptor(o,m))||void 0===v?void 0:v.set})}else f in c?c._prevInit&&null!==(d=n.overwrite)&&void 0!==d&&d[m]&&!(0,i.fS)(c._prevInit[m],o[m])&&(c[m]=o[m]):c[m]=g}for(var y=0,b=Object.keys(c);y<b.length;y++){var x=b[y];x in o||["_prevFn","_prevInit"].includes(x)||delete c[x]}c._prevFn=t.toString(),c._prevInit=o}else for(var w=t(),I=0,O=Object.entries(w);I<O.length;I++){var j,D,Z=(0,r.Z)(O[I],2),P=Z[0],k=Z[1];if("function"===typeof k)c[P]=k;else if(null!==(j=Object.getOwnPropertyDescriptor(c,P))&&void 0!==j&&j.get||null!==(D=Object.getOwnPropertyDescriptor(c,P))&&void 0!==D&&D.set){var S,E;Object.defineProperty(c,P,{get:null===(S=Object.getOwnPropertyDescriptor(w,P))||void 0===S?void 0:S.get,set:null===(E=Object.getOwnPropertyDescriptor(w,P))||void 0===E?void 0:E.set})}}else c._prevFn=t.toString(),c._prevInit=t()}),n.deps||[]),c}},71583:function(t,n,e){e.d(n,{Z:function(){return y}});var r=e(52209),o=e(59748),i=e(94184),a=e.n(i),c=e(88269),u=e(48103),s=e(44275),l=e(88767),d=e(95090),p=e(29120);var f,g,m=e(8311);function h(t,n){var e="undefined"!==typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!e){if(Array.isArray(t)||(e=function(t,n){if(!t)return;if("string"===typeof t)return v(t,n);var e=Object.prototype.toString.call(t).slice(8,-1);"Object"===e&&t.constructor&&(e=t.constructor.name);if("Map"===e||"Set"===e)return Array.from(t);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return v(t,n)}(t))||n&&t&&"number"===typeof t.length){e&&(t=e);var r=0,o=function(){};return{s:o,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,c=!1;return{s:function(){e=e.call(t)},n:function(){var t=e.next();return a=t.done,t},e:function(t){c=!0,i=t},f:function(){try{a||null==e.return||e.return()}finally{if(c)throw i}}}}function v(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=new Array(n);e<n;e++)r[e]=t[e];return r}function y(t){var n=(0,s.Z)((function(){return{root:{},parent:{},opts:{minScale:.05,maxScale:10,step:.1},pointers:[],isPanning:!1,x:0,y:0,scale:t.zoom||1,origin:void 0,start:{clientX:0,clientY:0,scale:t.zoom||1,distance:0},evt:{wheel:function(t){n.zoomWithWheel(t)},pointerdown:function(t){w(n.pointers,t),n.isPanning=!0,n.origin=new u.dl(n.x,n.y);var e=I(n.pointers);n.start={clientX:e.clientX,clientY:e.clientY,scale:n.scale,distance:O(n.pointers)}},pointermove:function(t){if(void 0!==n.origin&&void 0!==n.start.clientX&&void 0!==n.start.clientY){w(n.pointers,t);var e=I(n.pointers);if(n.pointers.length>1){0===n.start.distance&&(n.start.distance=O(n.pointers));var r=O(n.pointers)-n.start.distance,o=3*n.opts.step,i=Math.min(Math.max(r*o/80+n.start.scale,n.opts.minScale),n.opts.maxScale);n.zoomToPoint(i,e)}else n.pan(n.origin.x+(e.clientX-n.start.clientX)/n.scale,n.origin.y+(e.clientY-n.start.clientY)/n.scale)}},pointerup:function(e){if(function(t,n){if(n.touches){for(;t.length;)t.pop();return}var e=t.findIndex((function(t){return t.pointerId===n.pointerId}));e>-1&&t.splice(e,1)}(n.pointers,e),n.isPanning){if(t.stageKey){var r=j(n.root),o=new DOMMatrixReadOnly(window.getComputedStyle(n.root).transform).inverse().transformPoint({x:e.clientX-r.parent.left,y:e.clientY-r.parent.top}),i=(a=t.stageKey,(0,p.q9)(a));null===i||void 0===i||i.ptrEvent.next({key:"pointerup",point:{x:o.x,y:o.y}})}var a;n.isPanning=!1,n.origin=n.start.clientX=n.start.clientY=void 0}}},pan:function(t,e){n.x===t&&n.y===e||(n.x=t,n.y=e,n.updateView())},rootRef:function(t){t&&(n.root=t,n.parent=t.parentElement,n.parent.addEventListener("wheel",n.evt.wheel),n.parent.addEventListener("pointerdown",n.evt.pointerdown),n.parent.addEventListener("pointermove",n.evt.pointermove),n.parent.addEventListener("pointerup",n.evt.pointerup),n.parent.addEventListener("pointerleave",n.evt.pointerup),n.parent.addEventListener("pointercancel",n.evt.pointerup))},updateView:function(){n.root.style.transform="scale(".concat(n.scale,") translate(").concat(n.x,"px, ").concat(n.y,"px)")},zoom:function(t,e){t=Math.min(Math.max(t,n.opts.minScale),n.opts.maxScale);var r=n.x,o=n.y;if(e.focal){var i=e.focal;r=(i.x/t-i.x/n.scale+n.x*t)/t,o=(i.y/t-i.y/n.scale+n.y*t)/t}n.x=r,n.y=o,n.scale=t,n.updateView()},zoomToPoint:function(t,e){var r=j(n.root),o=r.parent.width-r.parent.padding.left-r.parent.padding.right-r.parent.border.left-r.parent.border.right,i=r.parent.height-r.parent.padding.top-r.parent.padding.bottom-r.parent.border.top-r.parent.border.bottom,a={x:(e.clientX-r.parent.left-r.parent.padding.left-r.parent.border.left-r.elem.margin.left)/o*(o*t),y:(e.clientY-r.parent.top-r.parent.padding.top-r.parent.border.top-r.elem.margin.top)/i*(i*t)};return n.zoom(t,{focal:a})},zoomWithWheel:function(t){t.preventDefault();var e=(0===t.deltaY&&t.deltaX?t.deltaX:t.deltaY)<0?1:-1,r=Math.min(Math.max(n.scale*Math.exp(e*n.opts.step/3),n.opts.minScale),n.opts.maxScale);return n.zoomToPoint(r,t)}}}));return function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"stage-default";(0,l.useQuery)(t,(function(){return{key:t,npcEvent:new d.x,ptrEvent:new d.x}}),{keepPreviousData:!0,staleTime:1/0})}(t.stageKey),o.default.useLayoutEffect((function(){if(t.zoom){var e=n.root.children[0].getBoundingClientRect(),r=e.x,o=e.y;n.zoomToPoint(t.zoom,{clientX:r,clientY:o})}}),[t.zoom]),(0,m.tZ)("div",{className:a()("panzoom-parent",b,x(t)),children:(0,m.BX)("div",{ref:n.rootRef,className:a()("panzoom-root",t.className),children:[(0,m.tZ)("div",{className:"origin"}),(0,m.tZ)("div",{className:"small-grid"}),t.children,(0,m.tZ)("div",{className:"large-grid"})]})})}var b=(0,c.iv)(f||(f=(0,r.Z)(["\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n  user-select: none;\n  /** This is important for mobile to prevent scrolling while panning */\n  touch-action: none;\n  cursor: auto;\n  \n  .panzoom-root {\n    width: 100%;\n    height: 100%;\n    user-select: none;\n    touch-action: none;\n    /** @panzoom/panzoom uses 50% 50% instead */\n    transform-origin: 0 0;\n    \n    .small-grid, .large-grid {\n      position: absolute;\n      pointer-events: none;\n      left: ","px;\n      top: ","px;\n      width: ","px;\n      height: ","px;\n      background-image:\n        linear-gradient(to right, rgba(200, 200, 200, 0.1) 1px, transparent 1px),\n        linear-gradient(to bottom, rgba(200, 200, 200, 0.15) 1px, transparent 1px);\n    }\n    .small-grid {\n      background-size: 10px 10px;\n    }\n    .large-grid {\n      background-size: 60px 60px;\n    }\n    .origin {\n      position: absolute;\n    }\n  }\n"])),-3600,-3600,7200,7200),x=function(t){return(0,c.iv)(g||(g=(0,r.Z)(["\n  background-color: ",";\n"])),t.dark?"#000":"#fff")};function w(t,n){var e;if(n.touches){e=0;var r,o=h(n.touches);try{for(o.s();!(r=o.n()).done;){var i=r.value;i.pointerId=e++,w(t,i)}}catch(a){o.e(a)}finally{o.f()}}else(e=t.findIndex((function(t){return t.pointerId===n.pointerId})))>-1&&t.splice(e,1),t.push(n)}function I(t){for(var n,e=(t=t.slice(0)).pop();n=t.pop();)e={clientX:(n.clientX-e.clientX)/2+e.clientX,clientY:(n.clientY-e.clientY)/2+e.clientY};return e}function O(t){if(t.length<2)return 0;var n=t[0],e=t[1];return Math.sqrt(Math.pow(Math.abs(e.clientX-n.clientX),2)+Math.pow(Math.abs(e.clientY-n.clientY),2))}function j(t){var n=t.parentNode,e=window.getComputedStyle(t),r=window.getComputedStyle(n),o=t.getBoundingClientRect(),i=n.getBoundingClientRect();return{elem:{style:e,width:o.width,height:o.height,top:o.top,bottom:o.bottom,left:o.left,right:o.right,margin:D(t,"margin",e),border:D(t,"border",e)},parent:{style:r,width:i.width,height:i.height,top:i.top,bottom:i.bottom,left:i.left,right:i.right,padding:D(n,"padding",r),border:D(n,"border",r)}}}function D(t,n){var e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:window.getComputedStyle(t),r="border"===n?"Width":"";return{left:Z("".concat(n,"Left").concat(r),e),right:Z("".concat(n,"Right").concat(r),e),top:Z("".concat(n,"Top").concat(r),e),bottom:Z("".concat(n,"Bottom").concat(r),e)}}function Z(t,n){return parseFloat(n[t])||0}},36694:function(t,n,e){e.d(n,{h:function(){return c}});var r=e(58474);function o(t){return function(n){if(function(t){return(0,r.m)(null===t||void 0===t?void 0:t.lift)}(n))return n.lift((function(n){try{return t(n,this)}catch(e){this.error(e)}}));throw new TypeError("Unable to lift unknown Observable type")}}var i=e(70655),a=function(t){function n(n,e,r,o,i){var a=t.call(this,n)||this;return a.onUnsubscribe=i,a._next=e?function(t){try{e(t)}catch(n){this.destination.error(n)}}:t.prototype._next,a._error=r?function(t){try{r(t)}catch(t){this.destination.error(t)}this.unsubscribe()}:t.prototype._error,a._complete=o?function(){try{o()}catch(t){this.destination.error(t)}this.unsubscribe()}:t.prototype._complete,a}return(0,i.ZT)(n,t),n.prototype.unsubscribe=function(){var n;!this.closed&&(null===(n=this.onUnsubscribe)||void 0===n||n.call(this)),t.prototype.unsubscribe.call(this)},n}(e(7038).Lv);function c(t,n){return o((function(e,r){var o=0;e.subscribe(new a(r,(function(e){return t.call(n,e,o++)&&r.next(e)})))}))}}}]);