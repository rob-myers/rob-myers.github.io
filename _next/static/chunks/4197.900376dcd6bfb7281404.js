"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4197],{4197:function(n,t,r){r.r(t),r.d(t,{default:function(){return U}});var e=r(79056),o=r(52209),a=r(59748),i=r(88269),c=r(95090),u=r(36694),s=r(91441),l=r(48103),f=r(97131),d=r(68216),p=r(25997),m=r(91077),g=r(30268),y=r(92953);function h(n){var t=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(n){return!1}}();return function(){var r,e=(0,y.Z)(n);if(t){var o=(0,y.Z)(this).constructor;r=Reflect.construct(e,arguments,o)}else r=e.apply(this,arguments);return(0,g.Z)(this,r)}}var v=function(n){(0,m.Z)(r,n);var t=h(r);function r(){return(0,d.Z)(this,r),t.apply(this,arguments)}return(0,p.Z)(r,null,[{key:"fromGmItems",value:function(n){var t=new r,o=[].concat((0,f.Z)(n.map((function(n,t){return{type:"gm",gmKey:n.key,gmIndex:t,id:b(n.key,n.transform),transform:n.transform}}))),(0,f.Z)(n.flatMap((function(n,t){var r=n.key,e=n.hullDoors,o=n.transform,a=n.pngRect;return e.map((function(n,e){var i=n.poly.center.addScaledVector(n.normal,20),c=a.contains(i);return{type:"door",gmKey:r,gmIndex:t,id:x(r,o,e),hullDoorIndex:e,transform:o,gmInFront:c}}))}))));t.registerNodes(o);var a=n.flatMap((function(n){var t=n.key,r=n.hullDoors,e=n.transform,o=b(t,e);return r.map((function(n,r){return{src:o,dst:x(t,e,r)}}))})),i=n.flatMap((function(t,r){var o=n.filter((function(n,e){return e>r&&n.gridRect.intersects(t.gridRect)}));console.info("geomorph to geomorph:",t,"--\x3e",o);var a=new l.UL,i=new l.UL,c=new l._3,u=new l._3;return t.hullDoors.flatMap((function(n,r){var s=x(t.key,t.transform,r);c.setMatrixValue(t.transform),a.copy(n.rect).applyMatrix(c);var l=o.flatMap((function(n){return n.hullDoors.map((function(t){return[n,t]}))})).find((function(n){var t=(0,e.Z)(n,2),r=t[0].transform,o=t[1].rect;return a.intersects(i.copy(o).applyMatrix(u.setMatrixValue(r)))}));if(void 0!==l){var f=(0,e.Z)(l,2),d=f[0],p=f[1],m=d.hullDoors.indexOf(p);return console.info("hull door to hull door:",t,r,"==>",d,d.hullDoors.indexOf(p)),{src:s,dst:x(d.key,d.transform,m)}}return[]}))}));return[].concat((0,f.Z)(a),(0,f.Z)(i)).forEach((function(n){var r=n.src,e=n.dst;r&&e&&(t.connect({src:r,dst:e}),t.connect({src:e,dst:r}))})),t}}]),r}(r(82405).b);function b(n,t){return"gm-".concat(n,"-[").concat(t,"]")}function x(n,t,r){return"door-".concat(n,"-[").concat(t,"]-").concat(r)}var k=r(27375),I=r(35650),w=r(84175),Z=r(60168),R=r(95814);var A,G,N=r(87079),O=r(30245),H=r(94184),K=r.n(H),S=r(77277),D=r(8311);function P(n,t){var r="undefined"!==typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(!r){if(Array.isArray(n)||(r=function(n,t){if(!n)return;if("string"===typeof n)return M(n,t);var r=Object.prototype.toString.call(n).slice(8,-1);"Object"===r&&n.constructor&&(r=n.constructor.name);if("Map"===r||"Set"===r)return Array.from(n);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return M(n,t)}(n))||t&&n&&"number"===typeof n.length){r&&(n=r);var e=0,o=function(){};return{s:o,n:function(){return e>=n.length?{done:!0}:{done:!1,value:n[e++]}},e:function(n){throw n},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,i=!0,c=!1;return{s:function(){r=r.call(n)},n:function(){var n=r.next();return i=n.done,n},e:function(n){c=!0,a=n},f:function(){try{i||null==r.return||r.return()}finally{if(c)throw a}}}}function M(n,t){(null==t||t>n.length)&&(t=n.length);for(var r=0,e=new Array(t);r<t;r++)e[r]=n[r];return e}function L(n){var t=(0,k.Z)(),r=(0,I.Z)((function(){var e={apis:[],root:{},npcRef:function(n){if(n){var t=r.apis.find((function(t){return n.classList.contains(t.key)}));t?(t.el={root:n},n.style.left="".concat(t.def.position.x,"px"),n.style.top="".concat(t.def.position.y,"px")):console.error("".concat(L.name,": npc not found for div.").concat(Array.from(n.classList.values()).join(".")))}},rootRef:function(n){n&&(r.root=n)},spawn:function(e){if((0,S.l)(n.stageKey)){console.log("spawning...",e),r.apis=r.apis.filter((function(n){return!e.some((function(t){return n.key===t.key}))}));var o,a=P(e);try{for(a.s();!(o=a.n()).done;){var i=o.value;r.apis.push({key:i.key,def:i,animState:"idle",el:{}})}}catch(c){a.e(c)}finally{a.f()}}else console.error("".concat(L.name,': cannot spawn into non-existent stage "').concat(n.stageKey,'"'));t()}};return n.onLoad(e),e}));return(0,D.tZ)("div",{className:C,ref:r.rootRef,children:(0,D.tZ)("div",{className:K()("npcs",{disabled:n.disabled}),onPointerDown:function(n){var e=n.target;(0,w.Nh)(r.apis.find((function(n){return e.classList.contains(n.key)}))).animState="walk",t()},onPointerUp:function(n){var e=n.target;(0,w.Nh)(r.apis.find((function(n){return e.classList.contains(n.key)}))).animState="idle",t()},children:r.apis.map((function(n){return(0,D.tZ)("div",{className:K()("npc",n.key,n.animState,B),ref:r.npcRef,children:(0,D.tZ)("div",{className:K()("body","no-select",n.key)})},n.key)}))})})}var j,C=(0,i.iv)(A||(A=(0,o.Z)(["\n  position: absolute;\n  canvas {\n    position: absolute;\n    pointer-events: none;\n  }\n  .npc {\n    position: absolute;\n  }\n"]))),E=new l.dl(51,26).scale(2),_=new l.dl(49,37).scale(2),B=(0,i.iv)(G||(G=(0,o.Z)(["\n  .body {\n    cursor: pointer;\n    position: absolute;\n    transform: scale(0.18);\n    pointer-events: all;\n    filter: grayscale(100%);\n  }\n  \n  &.walk .body {\n    width: ","px;\n    height: ","px;\n    left: ","px;\n    top: ","px;\n    animation: walk 300ms steps(",") infinite;\n    background: url('/npc/first-npc--walk.png');\n  }\n  &.idle .body {\n    width: ","px;\n    height: ","px;\n    left: ","px;\n    top: ","px;\n    animation: idle 2s steps(",") infinite;\n    background: url('/npc/first-npc--idle.png');\n  }\n\n  &.disabled .body {\n    animation-play-state: paused;\n  }\n\n  @keyframes walk {\n    from { background-position: 0px; }\n    to { background-position: ","px; }\n  }\n  @keyframes idle {\n    from { background-position: 0px; }\n    to { background-position: ","px; }\n  }\n"])),_.x,_.y,-_.x/2,-_.y/2,3,E.x,E.y,-E.x/2,-E.y/2,1,-3*_.x,-1*E.x);function U(n){var t=(0,k.Z)(),r=function(n){var t=a.default.useState((function(){return n.map((function(n){return n.layoutKey}))})),r=(0,e.Z)(t,2),o=r[0],i=r[1];a.default.useEffect((function(){var t=n.map((function(n){return n.layoutKey})).filter((function(n){return!o.includes(n)}));t.length&&i([].concat((0,f.Z)(o),(0,f.Z)(t)))}),[o]);var c=o.map((function(n){return(0,R.Z)(n,{staleTime:1/0})})),u=n.every((function(n){return o.includes(n.layoutKey)}))&&c.every((function(n){return n.data}));return a.default.useMemo((function(){if(u){var t=n.map((function(n){var t=o.findIndex((function(t){return t===n.layoutKey})),r=(0,w.Nh)(c[t].data),e=n.transform||[1,0,0,1,0,0];return(0,Z.mI)(r,e)}));return{gms:t,gmGraph:v.fromGmItems(t)}}return{gms:[],gmGraph:new v}}),[u])}([{layoutKey:"g-301--bridge"},{layoutKey:"g-101--multipurpose",transform:[1,0,0,1,0,600]},{layoutKey:"g-302--xboat-repair-bay",transform:[1,0,0,1,-1200,600]},{layoutKey:"g-302--xboat-repair-bay",transform:[-1,0,0,1,2400,600]},{layoutKey:"g-301--bridge",transform:[1,0,0,-1,0,2400]}]),o=r.gms,i=r.gmGraph,d=(0,I.Z)((function(){return{currentGmId:0,currentHoleId:2,clipPath:o.map((function(n){return"none"})),doorsApi:{ready:!1},npcsApi:{},wire:new c.x,getAdjacentHoleIds:function(){var n=d.currentGmId,t=o[n].roomGraph,r=d.doorsApi.getOpen(n),e=t.nodesArray[d.currentHoleId];return t.getEnterableRooms(e,r).map((function(n){return n.holeIndex}))},onChangeDeps:function(){if(o.length){d.update();var n=d.wire.pipe((0,u.h)((function(n){return"closed-door"===n.key||"opened-door"===n.key}))).subscribe((function(n){d.update()}));return function(){return n.unsubscribe()}}},update:function(){d.updateClipPath(),d.updateObservableDoors(),t()},updateClipPath:function(){var n=d.currentGmId,t=o[n],r=t.hullOutline,e=t.holesWithDoors,a=t.pngRect,i=[d.currentHoleId].concat(d.getAdjacentHoleIds()).map((function(n){return e[n]})),c=l.LA.cutOut(i,[r]).map((function(n){return n.translate(-a.x,-a.y)})).map((function(n){return"".concat(n.svgPath)})).join(" ");d.clipPath=d.clipPath.map((function(n){return"none"})),d.clipPath[n]="path('".concat(c,"')")},updateObservableDoors:function(){var n=this,t=d.currentGmId,r=o[t].roomGraph,e=r.nodesArray[d.currentHoleId],a=r.getAdjacentDoors(e);o.forEach((function(r,e){return n.doorsApi.setObservableDoors(e,t===e?a.map((function(n){return n.doorIndex})):[])}))}}}),[o],{equality:{currentGmId:!0,currentHoleId:!0}});return o.length?(0,D.BX)(N.Z,{stageKey:"stage-nav-demo-1",dark:!0,className:V,zoom:.4,children:[o.map((function(n){return(0,D.tZ)("img",{className:"geomorph",src:(0,s.qX)(n.key),draggable:!1,width:n.pngRect.width,height:n.pngRect.height,style:{left:n.pngRect.x,top:n.pngRect.y,transform:n.transformStyle,transformOrigin:n.transformOrigin}})})),(0,D.tZ)(L,{onLoad:function(n){d.npcsApi=n,t()},disabled:n.disabled,stageKey:"stage-nav-demo-1"}),o.map((function(n,t){return(0,D.tZ)("img",{className:"geomorph-dark",src:(0,s.qX)(n.key),draggable:!1,width:n.pngRect.width,height:n.pngRect.height,style:{clipPath:d.clipPath[t],WebkitClipPath:d.clipPath[t],left:n.pngRect.x,top:n.pngRect.y,transform:n.transformStyle,transformOrigin:n.transformOrigin}},t)})),d.doorsApi.ready&&(0,D.tZ)(X,{gms:o,gmGraph:i,doorsApi:d.doorsApi,currentGmId:d.currentGmId,currentHoleId:d.currentHoleId,setHole:function(n,t){var r=[n,t];d.currentGmId=r[0],d.currentHoleId=r[1],d.update()}}),(0,D.tZ)(O.Z,{gms:o,wire:d.wire,onLoad:function(n){return d.doorsApi=n}})]}):null}var V=(0,i.iv)(j||(j=(0,o.Z)(["\n  img {\n    position: absolute;\n    transform-origin: top left;\n  }\n  img.geomorph {\n    filter: brightness(80%);\n  }\n  img.geomorph-dark {\n    filter: invert(100%) brightness(55%) contrast(200%) sepia(0%);\n  }\n"])));function X(n){return(0,D.BX)("div",{onClick:function(t){var r=t.target,o=Number(r.getAttribute("data-gm-index")),a=Number(r.getAttribute("data-door-index")),i=n.gms[o],c=i.doors[a],u=c.holeIds.filter((function(t){return t!==n.currentHoleId})),s=(0,e.Z)(u,1)[0];if(null!==s)return n.setHole(n.currentGmId,s);var l=n.gmGraph,f=i.hullDoors.indexOf(c),d=l.getNodeById(b(i.key,i.transform)),p=l.getNodeById(x(i.key,i.transform,f));if(p){var m=l.getSuccs(p).filter((function(n){return n!==d})),g=(0,e.Z)(m,1)[0];return g?(console.log("hull",{otherGmNode:g}),n.setHole(g.gmIndex,0)):void 0}},children:[n.outlines&&n.gms.map((function(n,t){return(0,D.tZ)("div",{style:{position:"absolute",left:n.gridRect.x,top:n.gridRect.y,width:n.gridRect.width,height:n.gridRect.height,border:"2px red solid"}},t)})),n.gms.map((function(t,r){var e=n.doorsApi.getObservable(r);return(0,D.tZ)("div",{className:"debug",style:{transform:t.transformStyle,transformOrigin:"".concat(t.pngRect.x,"px ").concat(t.pngRect.y,"px"),position:"absolute"},children:t.doors.map((function(t,o){var a=t.poly,i=t.normal,c=t.holeIds;if(e.includes(o)){var u=c[0]===n.currentHoleId?1:c[1]===n.currentHoleId?-1:0,s=l.dl.from(i).scale(-u||0).angle,f=a.center.addScaledVector(i,15*u);return(0,D.tZ)("div",{"data-gm-index":r,"data-door-index":o,style:{width:2*q,height:2*q,borderRadius:q,position:"absolute",left:f.x-q,top:f.y-q,transform:"rotate(".concat(s,"rad)"),backgroundImage:"url('/icon/solid_arrow-circle-right.svg')",cursor:"pointer"}},o)}return null}))},t.itemKey)}))]})}var q=4}}]);