"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1746],{30245:function(n,t,e){e.d(t,{Z:function(){return h}});var r,o=e(52209),i=e(92809),a=e(59748),c=e(88269),s=e(94184),l=e.n(s),u=e(16716),d=e(84175),f=e(50269),p=e(44275),m=e(27375),g=e(8311);function v(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,r)}return e}function y(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?v(Object(e),!0).forEach((function(t){(0,i.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):v(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function h(n){var t=(0,m.Z)(),e=(0,p.Z)((function(){return{events:new u.x,ready:!0,getClosed:function(t){var r=e.open[t];return n.gms[t].doors.map((function(n,t){return t})).filter((function(n){return!r[n]}))},getOpen:function(n){return Object.keys(e.open[n]).map(Number)},getVisible:function(n){return Object.keys(e.vis[n]).map(Number)},setVisible:function(n,r){e.vis[n]=r.reduce((function(n,t){return y(y({},n),{},(0,i.Z)({},t,!0))}),{}),e.drawInvisibleInCanvas(n),t()},canvas:[],open:n.gms.map((function(t,e){return(n.initOpen[e]||[]).reduce((function(n,t){return y(y({},n),{},(0,i.Z)({},t,!0))}),{})})),vis:n.gms.map((function(n){return{}})),rootEl:{},onToggleDoor:function(t){var r=t.target.getAttribute("data-gm-id"),o=Number(r),i=Number(t.target.getAttribute("data-door-id")),a=Number(t.target.getAttribute("data-hull-door-id")),c=-1===a?null:n.gmGraph.getDoorNodeByIds(o,a);if(null!==r&&e.vis[o][i]&&(null===c||void 0===c||!c.sealed)){var s=-1!==a?n.gmGraph.getAdjacentRoomCtxt(o,a):null;e.open[o][i]?(delete e.open[o][i],s&&delete e.open[s.adjGmId][s.adjDoorId]):(e.open[o][i]=!0,s&&(e.open[s.adjGmId][s.adjDoorId]=!0));var l=e.open[o][i]?"opened-door":"closed-door";e.events.next({key:l,gmIndex:o,index:i}),s&&e.events.next({key:l,gmIndex:s.adjGmId,index:s.adjDoorId}),e.drawInvisibleInCanvas(o)}},drawInvisibleInCanvas:function(t){var r=e.canvas[t],o=(0,d.Cq)(r.getContext("2d")),i=n.gms[t];o.setTransform(1,0,0,1,0,0),o.clearRect(0,0,r.width,r.height),o.setTransform(1,0,0,1,-i.pngRect.x,-i.pngRect.y),o.strokeStyle="#ffd",o.fillStyle="#aaaaaa44",o.lineWidth=.5,i.doors.forEach((function(n,r){var i=n.poly;e.vis[t][r]||((0,f.P6)(o,[i]),o.fill())}))}}}));return a.default.useEffect((function(){n.onLoad(e)}),[]),a.default.useEffect((function(){return n.gms.forEach((function(n,t){return e.drawInvisibleInCanvas(t)})),e.rootEl.addEventListener("pointerup",e.onToggleDoor),function(){e.rootEl.removeEventListener("pointerup",e.onToggleDoor)}}),[n.gms]),(0,g.tZ)("div",{ref:function(n){return n&&(e.rootEl=n)},className:l()("doors",x),children:n.gms.map((function(n,t){return(0,g.BX)("div",{style:{transform:n.transformStyle},children:[n.doors.map((function(r,o){return e.vis[t][o]&&(0,g.tZ)("div",{className:l()("door",{open:e.open[t][o],iris:r.tags.includes("iris")}),style:{left:r.rect.x,top:r.rect.y,width:r.rect.width,height:r.rect.height,transform:"rotate(".concat(r.angle,"rad)"),transformOrigin:"top left"},children:(0,g.tZ)("div",{className:"door-touch-ui","data-gm-id":t,"data-door-id":o,"data-hull-door-id":n.hullDoors.indexOf(r)})},o)})),(0,g.tZ)("canvas",{ref:function(n){return n&&(e.canvas[t]=n)},width:n.pngRect.width,height:n.pngRect.height,style:{left:n.pngRect.x,top:n.pngRect.y}})]},n.itemKey)}))})}var x=(0,c.iv)(r||(r=(0,o.Z)(["\n  position: absolute;\n\n  canvas {\n    position: absolute;\n    pointer-events: none;\n  }\n\n  div.door {\n    position: absolute;\n    pointer-events: none;\n    \n    .door-touch-ui {\n      cursor: pointer;\n      pointer-events: all;\n      position: absolute;\n      left: calc(50% - ","px);\n      top: calc(50% - ","px);\n      width: ","px;\n      height: 20px;\n      background: rgba(100, 0, 0, 0.1);\n      border-radius: ","px;\n    }\n\n    &:not(.iris) {\n      background: #fff;\n      border: 1px solid #555;\n\n      transition: width 300ms ease-in;\n      &.open {\n        width: 4px !important;\n      }\n    }\n\n    &.iris {\n      background-image: linear-gradient(45deg, #888 33.33%, #333 33.33%, #333 50%, #888 50%, #888 83.33%, #333 83.33%, #333 100%);\n      background-size: 4.24px 4.24px;\n      border: 1px solid #fff;\n      \n      opacity: 1;\n      transition: opacity 300ms ease;\n      &.open {\n        opacity: 0.2;\n      }\n    }\n  }\n"])),20,10,40,10)},97301:function(n,t,e){e.d(t,{Z:function(){return R}});var r=e(97131),o=e(79056),i=e(59748),a=e(84175),c=e(68216),s=e(25997),l=e(14695),u=e(91077),d=e(30268),f=e(92953),p=e(92809),m=e(48103),g=e(82405),v=e(68451),y=e(39660),h=e(2026);function x(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,r)}return e}function I(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?x(Object(e),!0).forEach((function(t){(0,p.Z)(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):x(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function b(n){var t=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(n){return!1}}();return function(){var e,r=(0,f.Z)(n);if(t){var o=(0,f.Z)(this).constructor;e=Reflect.construct(r,arguments,o)}else e=r.apply(this,arguments);return(0,d.Z)(this,e)}}var w=function(n){(0,u.Z)(e,n);var t=b(e);function e(n){var r;return(0,c.Z)(this,e),r=t.call(this),(0,p.Z)((0,l.Z)(r),"gms",void 0),(0,p.Z)((0,l.Z)(r),"gmData",void 0),(0,p.Z)((0,l.Z)(r),"entry",void 0),r.gms=n,r.gmData=n.reduce((function(n,t){return I(I({},n),{},(0,p.Z)({},t.key,t))}),{}),r.entry=new Map,r}return(0,s.Z)(e,[{key:"findPath",value:function(n,t){var e=this,r=this.gms.findIndex((function(t){return t.gridRect.contains(n)})),o=this.gms.findIndex((function(n){return n.gridRect.contains(t)}));if(-1===r||-1===o)return null;for(var i=[],a=m.dl.from(n),c=m.dl.from(t).sub(n),s=r;s!==o;){var l=v.J.compassPoints(c),u=l.flatMap((function(n){return e.getConnectedDoorsBySide(s,n)})).reduce((function(n,r){var o=e.getDoorEntry(r),i=o.distanceToSquared(t);return!n.node||i<n.d?{d:i,v:o,node:r}:n}),{d:1/0,v:new m.dl});if(!u.node)return(0,h.vU)("global nav: ".concat(s," ").concat(l,": no closest node")),null;var d=this.getAdjacentDoor(u.node);if(!d||d.gmId===s)return(0,h.vU)("global nav: ".concat(s," ").concat(u.node.id," has no adjacent door")),null;i.push({srcGmId:s,srcRoomId:this.gms[s].doors[u.node.doorId].roomIds.find((function(n){return null!==n})),srcDoorId:u.node.doorId,srcHullDoorId:u.node.hullDoorId,srcExit:u.v,dstGmId:d.gmId,dstRoomId:this.gms[d.gmId].doors[d.doorId].roomIds.find((function(n){return null!==n})),dstDoorId:d.doorId,dstHullDoorId:d.hullDoorId,dstEntry:this.getDoorEntry(d)}),s=d.gmId,a.copy(u.v),c.copy(t).sub(a)}return i}},{key:"getAdjacentDoor",value:function(n){var t=this.getSuccs(n).find((function(n){return"door"===n.type}));return t||null}},{key:"getConnectedDoorsBySide",value:function(n,t){var e=this.nodesArray[n];return this.getSuccs(e).filter((function(n){return!n.sealed&&n.direction===t}))}},{key:"getAdjacentRoomCtxt",value:function(n,t){var e=this.gms[n],r=this.nodesArray[n],o=j(e.key,e.transform,t),i=this.getNodeById(o);if(!i)return console.error("GmGraph: failed to find hull door node: ".concat(o)),null;var a=this.getSuccs(i).find((function(n){return n!==r}));if(!a)return console.info("GmGraph hull door: ".concat(o," on boundary")),null;var c=a.gmId,s=a.hullDoorId,l=a.doorId;return{adjGmId:c,adjRoomId:this.gms[c].hullDoors[s].roomIds.find((function(n){return"number"===typeof n})),adjHullId:s,adjDoorId:l}}},{key:"getDoorEntry",value:function(n){return this.entry.get(n)}},{key:"getDoorNode",value:function(n){return this.getNodeById(n)}},{key:"getDoorNodeByIds",value:function(n,t){var e=this.gms[n],r=j(e.key,e.transform,t);return this.getNodeById(r)}},{key:"getOpenDoorArea",value:function(n,t){var e=this.gms[n],r=e.doors[t],o=e.hullDoors.indexOf(r);if(-1===o){var i=e.roomGraph.getAdjacentRooms(e.roomGraph.getDoorNode(t)).map((function(n){return e.roomsWithDoors[n.roomId]}));return{gmIndex:n,doorIndex:t,adjRoomId:null,poly:m.LA.union(i)[0]}}var a=this.getAdjacentRoomCtxt(n,o);if(a){var c=r.roomIds.find((function(n){return"number"===typeof n})),s=this.gms[a.adjGmId],l=s.roomsWithDoors[a.adjRoomId],u=m.LA.union([e.roomsWithDoors[c].clone().applyMatrix(e.matrix).applyMatrix(s.inverseMatrix),l])[0];return{gmIndex:a.adjGmId,doorIndex:a.adjDoorId,adjRoomId:a.adjRoomId,poly:u}}return console.error("GmGraph: getOpenDoorArea: failed to get context",{gmIndex:n,doorIndex:t,hullDoorIndex:o}),null}},{key:"getOpenWindowPolygon",value:function(n,t){var e=this.gms[n],r=e.windows[t],o=e.roomGraph.getAdjacentRooms(e.roomGraph.getWindowNode(t));return m.LA.union(o.map((function(n){return e.rooms[n.roomId]})).concat(r.poly))[0]}},{key:"computeLightPolygons",value:function(n,t,e){var o=this,i=this.gms[n],a=i.roomGraph.nodesArray[t],c=i.roomGraph.getAdjacentDoors(a).map((function(n){return n.doorId})).filter((function(n){return e.includes(n)})).flatMap((function(t){return o.getOpenDoorArea(n,t)||[]})).map((function(n){var e,r=o.gms[n.gmIndex].doors,i=r.filter((function(t,e){return e!==n.doorIndex})).map((function(n){return n.seg}));return{gmIndex:n.gmIndex,poly:v.J.lightPolygon({position:(0,y.AR)(r[n.doorIndex],null!==(e=n.adjRoomId)&&void 0!==e?e:t,-10),range:2e3,exterior:n.poly,extraSegs:i})}})),s=i.roomGraph.getAdjacentWindows(a).filter((function(n){var e=i.windows[n.windowIndex];return!e.tags.includes("frosted")&&(!e.tags.includes("one-way")||e.roomIds[0]===t)})).map((function(n){return n.windowIndex})).map((function(e){return{gmIndex:n,poly:v.J.lightPolygon({position:(0,y.AR)(i.windows[e],t,20),range:1e3,exterior:o.getOpenWindowPolygon(n,e)})}}));return[].concat((0,r.Z)(c),(0,r.Z)(s))}}],[{key:"computeHullDoorDirection",value:function(n,t,e){var r=n.tags.find((function(n){return/^hull\-[nesw]$/.test(n)}));if(r){var o=r.slice(-1),i=v.e.indexOf(o),a={x:e[0],y:e[1]},c={x:e[2],y:e[3]};if(1===a.x){if(1===c.y)return i;if(-1===c.y)return v.J.getFlippedDirection(i,"x")}else if(1===a.y){if(1===c.x)return v.J.getFlippedDirection(v.J.getDeltaDirection(i,2),"y");if(-1===a.x)return v.J.getDeltaDirection(i,1)}else if(-1===a.x){if(1===c.y)return v.J.getFlippedDirection(i,"y");if(-1===c.y)return v.J.getDeltaDirection(i,2)}else if(-1===a.y){if(1===c.x)return v.J.getDeltaDirection(i,3);if(-1===c.x)return v.J.getFlippedDirection(v.J.getDeltaDirection(i,3),"y")}(0,h.vU)("hullDoor ".concat(t,": ").concat(r,': failed to parse transform "').concat(e,'"'))}else(0,h.vU)("hullDoor ".concat(t,': expected tag "hull-{n,e,s,w}" in hull door'));return null}},{key:"fromGms",value:function(n){var t=this,i=new e(n),a=[].concat((0,r.Z)(n.map((function(n,t){return{type:"gm",gmKey:n.key,gmIndex:t,id:D(n.key,n.transform),transform:n.transform}}))),(0,r.Z)(n.flatMap((function(n,e){var r=n.key,o=n.hullDoors,i=n.transform,a=n.pngRect,c=n.doors;return o.map((function(n,o){var s=n.poly.center.addScaledVector(n.normal,20),l=a.contains(s),u=t.computeHullDoorDirection(n,o,i);return{type:"door",gmKey:r,gmId:e,id:j(r,i,o),doorId:c.indexOf(n),hullDoorId:o,transform:i,gmInFront:l,direction:u,sealed:!0}}))}))));i.registerNodes(a),a.forEach((function(t){if("door"===t.type){var e=n[t.gmId],r=e.matrix,o=e.doors[t.doorId].entries.find(Boolean);i.entry.set(t,r.transformPoint(o.clone()))}}));var c=n.flatMap((function(n){var t=n.key,e=n.hullDoors,r=n.transform,o=D(t,r);return e.map((function(n,e){return{src:o,dst:j(t,r,e)}}))})),s=n.flatMap((function(t,e){var r=n.filter((function(n,r){return r!==e&&n.gridRect.intersects(t.gridRect)})),a=new m.UL,c=new m.UL,s=new m._3,l=new m._3;return t.hullDoors.flatMap((function(n,e){var u=j(t.key,t.transform,e);s.setMatrixValue(t.transform),a.copy(n.poly.rect.applyMatrix(s));var d=r.flatMap((function(n){return n.hullDoors.map((function(t){return[n,t]}))})).find((function(n){var t=(0,o.Z)(n,2),e=t[0].transform,r=t[1].poly;return a.intersects(c.copy(r.rect.applyMatrix(l.setMatrixValue(e))))}));if(void 0!==d){var f=(0,o.Z)(d,2),p=f[0],m=f[1],g=p.hullDoors.indexOf(m),v=j(p.key,p.transform,g);return i.getDoorNode(u).sealed=!1,{src:u,dst:v}}return[]}))}));return[].concat((0,r.Z)(c),(0,r.Z)(s)).forEach((function(n){var t=n.src,e=n.dst;t&&e&&(i.connect({src:t,dst:e}),i.connect({src:e,dst:t}))})),i}}]),e}(g.b);function D(n,t){return"gm-".concat(n,"-[").concat(t,"]")}function j(n,t,e){return"door-".concat(n,"-[").concat(t,"]-").concat(e)}var O=e(95814);function R(n){var t=i.default.useState((function(){return n.map((function(n){return n.layoutKey}))})),e=(0,o.Z)(t,2),c=e[0],s=e[1];i.default.useMemo((function(){var t=n.map((function(n){return n.layoutKey})).filter((function(n){return!c.includes(n)}));t.length&&s([].concat((0,r.Z)(c),(0,r.Z)(t)))}),[n]);var l=c.map((function(n){return(0,O.Z)(n,{staleTime:1/0})})),u=n.every((function(n){return c.includes(n.layoutKey)}))&&l.every((function(n){return n.data}));return i.default.useMemo((function(){if(u){var t=n.map((function(n){var t=c.findIndex((function(t){return t===n.layoutKey})),e=(0,a.Nh)(l[t].data),r=n.transform||[1,0,0,1,0,0];return(0,y.OQ)(e,r)}));return{gms:t,gmGraph:w.fromGms(t)}}return{gms:[],gmGraph:new w([])}}),[u])}},87079:function(n,t,e){e.d(t,{Z:function(){return x}});var r,o,i=e(52209),a=e(30266),c=e(809),s=e.n(c),l=e(59748),u=e(94184),d=e.n(u),f=e(88269),p=e(16716),m=e(48103),g=e(44275),v=e(8311);function y(n,t){var e="undefined"!==typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(!e){if(Array.isArray(n)||(e=function(n,t){if(!n)return;if("string"===typeof n)return h(n,t);var e=Object.prototype.toString.call(n).slice(8,-1);"Object"===e&&n.constructor&&(e=n.constructor.name);if("Map"===e||"Set"===e)return Array.from(n);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return h(n,t)}(n))||t&&n&&"number"===typeof n.length){e&&(n=e);var r=0,o=function(){};return{s:o,n:function(){return r>=n.length?{done:!0}:{done:!1,value:n[r++]}},e:function(n){throw n},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,a=!0,c=!1;return{s:function(){e=e.call(n)},n:function(){var n=e.next();return a=n.done,n},e:function(n){c=!0,i=n},f:function(){try{a||null==e.return||e.return()}finally{if(c)throw i}}}}function h(n,t){(null==t||t>n.length)&&(t=n.length);for(var e=0,r=new Array(t);e<t;e++)r[e]=n[e];return r}function x(n){var t=(0,g.Z)((function(){return{parent:{},translateRoot:{},scaleRoot:{},panning:!1,opts:{minScale:.05,maxScale:10,step:.05,idleMs:200},pointers:[],origin:void 0,scale:1,start:{clientX:void 0,clientY:void 0,scale:1,distance:0},x:0,y:0,events:new p.x,idleTimeoutId:0,transitionTimeoutId:0,anims:[null,null],evt:{wheel:function(n){t.delayIdle(),t.cancelAnimations(),t.zoomWithWheel(n)},pointerdown:function(n){t.delayIdle(),t.cancelAnimations(),w(t.pointers,n),t.panning=!0,t.origin=new m.dl(t.x,t.y);var e=D(t.pointers);t.start={clientX:e.clientX,clientY:e.clientY,scale:t.scale,distance:j(t.pointers)}},pointermove:function(n){if(void 0!==t.origin&&void 0!==t.start.clientX&&void 0!==t.start.clientY){t.delayIdle(),w(t.pointers,n);var e=D(t.pointers);if(t.pointers.length>1){0===t.start.distance&&(t.start.distance=j(t.pointers));var r=j(t.pointers)-t.start.distance,o=3*t.opts.step,i=Math.min(Math.max(r*o/80+t.start.scale,t.opts.minScale),t.opts.maxScale);t.zoomToClient(i,e)}else t.pan(t.origin.x+(e.clientX-t.start.clientX)/t.scale,t.origin.y+(e.clientY-t.start.clientY)/t.scale)}},pointerup:function(n){if(function(n,t){if(t.touches){for(;n.length;)n.pop();return}var e=n.findIndex((function(n){return n.pointerId===t.pointerId}));e>-1&&n.splice(e,1)}(t.pointers,n),t.panning){var e=t.getWorld(n);t.events.next({key:"pointerup",point:{x:e.x,y:e.y},tags:(n.target.getAttribute("data-tags")||"").split(" ")}),t.panning=!1,t.origin=t.start.clientX=t.start.clientY=void 0}}},cancelAnimations:function(){t.anims[0]&&(t.syncStyles(),t.anims.forEach((function(n){return null===n||void 0===n?void 0:n.cancel()})))},delayIdle:function(){t.idleTimeoutId&&window.clearTimeout(t.idleTimeoutId),t.idleTimeoutId=window.setTimeout(t.idleTimeout,t.opts.idleMs)},getCurrentTransform:function(){var n=t.parent.getBoundingClientRect(),e=t.translateRoot.getBoundingClientRect();return{x:e.x-n.x,y:e.y-n.y,scale:t.scaleRoot.getBoundingClientRect().width}},getWorld:function(n){var e=t.parent.getBoundingClientRect(),r=n.clientX-e.left,o=n.clientY-e.top,i=t.getCurrentTransform();return{x:(r-i.x)/i.scale,y:(o-i.y)/i.scale}},getWorldAtCenter:function(){var n=t.parent.getBoundingClientRect(),e=t.getCurrentTransform();return{x:(n.width/2-e.x)/e.scale,y:(n.height/2-e.y)/e.scale}},idleTimeout:function(){0===t.pointers.length?(t.events.next({key:"ui-idle"}),t.idleTimeoutId=0):t.delayIdle()},isIdle:function(){return 0===t.idleTimeoutId},pan:function(n,e){t.x===n&&t.y===e||(t.x=n,t.y=e,t.setStyles())},panZoomTo:function(n,e,r,o){return(0,a.Z)(s().mark((function i(){var a,c,l,u,d,f,p,m,g,v,y,h;return s().wrap((function(i){for(;;)switch(i.prev=i.next){case 0:if(n=n||t.scale,o=o||"ease",n===t.scale){i.next=11;break}a=t.parent.getBoundingClientRect(),c=a.width,l=a.height,u=t.getCurrentTransform(),e=e||t.getWorldAtCenter(),d=c/2-n*e.x,f=l/2-n*e.y,t.anims=[t.translateRoot.animate([{offset:0,transform:"translate(".concat(u.x,"px, ").concat(u.y,"px)")},{offset:1,transform:"translate(".concat(d,"px, ").concat(f,"px)")}],{duration:r,direction:"normal",fill:"forwards",easing:o}),t.scaleRoot.animate([{offset:0,transform:"scale(".concat(u.scale,")")},{offset:1,transform:"scale(".concat(n,")")}],{duration:r,direction:"normal",fill:"forwards",easing:o})],i.next=20;break;case 11:if(!e){i.next=19;break}p=t.parent.getBoundingClientRect(),m=p.width,g=p.height,v=t.getCurrentTransform(),y=m/2-v.scale*e.x,h=g/2-v.scale*e.y,t.anims[0]=t.translateRoot.animate([{offset:0,transform:"translate(".concat(v.x,"px, ").concat(v.y,"px)")},{offset:1,transform:"translate(".concat(y,"px, ").concat(h,"px)")}],{duration:r,direction:"normal",fill:"forwards",easing:o}),i.next=20;break;case 19:return i.abrupt("return");case 20:return i.next=22,new Promise((function(n,e){var r=t.anims[0],o=!1;r.addEventListener("finish",(function(){o=!0,t.syncStyles(),t.anims.forEach((function(n){return null===n||void 0===n?void 0:n.cancel()}))})),r.addEventListener("cancel",(function(){t.anims=[null,null],o?n("completed"):e("cancelled")}))}));case 22:case"end":return i.stop()}}),i)})))()},rootRef:function(n){n&&(t.parent=n.parentElement,t.translateRoot=n,t.scaleRoot=n.children[0],t.parent.addEventListener("wheel",(function(n){return t.evt.wheel(n)})),t.parent.addEventListener("pointerdown",(function(n){return t.evt.pointerdown(n)})),t.parent.addEventListener("pointermove",(function(n){return t.evt.pointermove(n)})),t.parent.addEventListener("pointerup",(function(n){return t.evt.pointerup(n)})),t.parent.addEventListener("pointerleave",(function(n){return t.evt.pointerup(n)})),t.parent.addEventListener("pointercancel",(function(n){return t.evt.pointerup(n)})))},syncStyles:function(){Object.assign(t,t.getCurrentTransform()),t.setStyles()},setStyles:function(){t.translateRoot.style.transform="translate(".concat(t.x,"px, ").concat(t.y,"px)"),t.scaleRoot.style.transform="scale(".concat(t.scale,")")},zoomToClient:function(n,e){var r=t.parent.getBoundingClientRect(),o=e.clientX-r.left,i=e.clientY-r.top,a=(o-t.x)/t.scale,c=(i-t.y)/t.scale;t.x=o-a*n,t.y=i-c*n,t.scale=n,t.setStyles()},zoomWithWheel:function(n){n.preventDefault();var e=(0===n.deltaY&&n.deltaX?n.deltaX:n.deltaY)<0?1:-1,r=Math.min(Math.max(t.scale*Math.exp(e*t.opts.step*.5/3),t.opts.minScale),t.opts.maxScale);t.zoomToClient(r,n)}}}),{deeper:["evt"]});return l.default.useEffect((function(){var e;null===(e=n.onLoad)||void 0===e||e.call(n,t),t.setStyles(),t.panZoomTo(n.initZoom||1,n.initCenter||{x:0,y:0},1e3)}),[]),(0,v.tZ)("div",{className:d()("panzoom-parent",I,b(n)),"data-tags":"floor",children:(0,v.tZ)("div",{ref:t.rootRef,className:d()("panzoom-translate",n.className),children:(0,v.BX)("div",{className:"panzoom-scale",children:[(0,v.tZ)("div",{className:"origin"}),n.children,(0,v.tZ)("div",{className:"large-grid"})]})})})}var I=(0,f.iv)(r||(r=(0,i.Z)(["\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n  user-select: none;\n  /** This is important for mobile to prevent scrolling while panning */\n  touch-action: none;\n  cursor: auto;\n  \n  .panzoom-translate {\n    width: 0;\n    height: 0;\n    user-select: none;\n    touch-action: none;\n    transform-origin: 0 0;\n    \n    .panzoom-scale {\n      /** So can infer scale during CSS animation via getBoundingClientRect().width */\n      width: 1px;\n      height: 1px;\n      transform-origin: 0 0;\n    }\n\n    .small-grid, .large-grid {\n      position: absolute;\n      pointer-events: none;\n      left: ","px;\n      top: ","px;\n      width: ","px;\n      height: ","px;\n    }\n    .small-grid {\n      background-image:\n        linear-gradient(to right, rgba(200, 200, 200, 0.15) 1px, transparent 1px),\n        linear-gradient(to bottom, rgba(200, 200, 200, 0.15) 1px, transparent 1px);\n        background-size: 10px 10px;\n      }\n      .large-grid {\n      background-image:\n        linear-gradient(to right, rgba(200, 200, 200, 0.15) 1px, transparent 1px),\n        linear-gradient(to bottom, rgba(200, 200, 200, 0.15) 1px, transparent 1px);\n      background-size: 60px 60px;\n    }\n    .origin {\n      position: absolute;\n    }\n  }\n"])),-3600,-3600,7200,7200),b=function(n){return(0,f.iv)(o||(o=(0,i.Z)(["\n  background-color: ",";\n"])),n.dark?"#000":"#fff")};function w(n,t){var e;if(t.touches){e=0;var r,o=y(t.touches);try{for(o.s();!(r=o.n()).done;){var i=r.value;i.pointerId=e++,w(n,i)}}catch(a){o.e(a)}finally{o.f()}}else(e=n.findIndex((function(n){return n.pointerId===t.pointerId})))>-1&&n.splice(e,1),n.push(t)}function D(n){for(var t,e=(n=n.slice(0)).pop();t=n.pop();)e={clientX:(t.clientX-e.clientX)/2+e.clientX,clientY:(t.clientY-e.clientY)/2+e.clientY};return e}function j(n){if(n.length<2)return 0;var t=n[0],e=n[1];return Math.sqrt(Math.pow(Math.abs(e.clientX-t.clientX),2)+Math.pow(Math.abs(e.clientY-t.clientY),2))}}}]);