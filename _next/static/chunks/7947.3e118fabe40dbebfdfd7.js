"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7947,3260],{87947:function(n,t,e){e.r(t),e.d(t,{default:function(){return R}});var r,o=e(52209),a=(e(59748),e(88269)),i=e(95090),s=e(36694),c=e(84175),d=e(91441),l=e(48103),u=e(27375),p=e(2074),f=e(35650),g=e(87079),h=e(30245),b=e(94184),m=e.n(b),y=e(43260),v=e(8311);function k(n,t){var e="undefined"!==typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(!e){if(Array.isArray(n)||(e=function(n,t){if(!n)return;if("string"===typeof n)return w(n,t);var e=Object.prototype.toString.call(n).slice(8,-1);"Object"===e&&n.constructor&&(e=n.constructor.name);if("Map"===e||"Set"===e)return Array.from(n);if("Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e))return w(n,t)}(n))||t&&n&&"number"===typeof n.length){e&&(n=e);var r=0,o=function(){};return{s:o,n:function(){return r>=n.length?{done:!0}:{done:!1,value:n[r++]}},e:function(n){throw n},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,i=!0,s=!1;return{s:function(){e=e.call(n)},n:function(){var n=e.next();return i=n.done,n},e:function(n){s=!0,a=n},f:function(){try{i||null==e.return||e.return()}finally{if(s)throw a}}}}function w(n,t){(null==t||t>n.length)&&(t=n.length);for(var e=0,r=new Array(t);e<t;e++)r[e]=n[e];return r}function x(n){var t=(0,u.Z)(),e=(0,f.Z)((function(){var r={apis:[],background:{},root:{},npcRef:function(n){if(n){var t=e.apis.find((function(t){return n.classList.contains(t.key)}));t?(t.el={root:n},n.style.left="".concat(t.def.position.x,"px"),n.style.top="".concat(t.def.position.y,"px")):console.error("".concat(x.name,": npc not found for div.").concat(Array.from(n.classList.values()).join(".")))}},rootRef:function(t){if(t){e.root=t;var r=t.querySelector("canvas.background");r.width=n.gm.d.pngRect.width,r.height=n.gm.d.pngRect.height,e.background=r}},spawn:function(n){console.log("spawning",n);var r,o=k(n);try{for(o.s();!(r=o.n()).done;){var a=r.value;e.apis.push({key:a.key,def:a,el:{}})}}catch(i){o.e(i)}finally{o.f()}t()}};return n.onLoad(r),r}));return(0,v.BX)("div",{className:Z,ref:e.rootRef,children:[(0,v.tZ)("canvas",{className:"background"}),(0,v.tZ)("div",{className:m()("npcs",{disabled:n.disabled}),children:e.apis.map((function(t){return(0,v.tZ)("div",{className:"npc ".concat(t.key),ref:e.npcRef,children:(0,v.tZ)(y.default,{disabled:n.disabled})},t.key)}))})]})}var A,Z=(0,a.iv)(r||(r=(0,o.Z)(["\n  position: absolute;\n  canvas {\n    position: absolute;\n  }\n  .npc {\n    position: absolute;\n  }\n"])));function R(n){var t=(0,u.Z)(),e=(0,p.Z)(n.layoutKey,{staleTime:1/0}).data,r=(0,f.Z)((function(){return{clipPath:"none",currentHoleId:0,doorsApi:{},get gm(){return(0,c.Nh)(e)},npcsApi:{},wire:new i.x,getAdjacentHoleIds:function(){var n=r.gm.d.roomGraph,t=r.doorsApi.getOpen();return n.getEnterableRooms(n.nodesArray[r.currentHoleId],t).map((function(n){return n.holeIndex}))},onChangeDeps:function(){if(e){r.updateClipPath(),r.updateObservableDoors(),t(),r.npcsApi.spawn([{key:"andros",position:{x:50,y:38}}]);var n=r.wire.pipe((0,s.h)((function(n){return"closed-door"===n.key||"opened-door"===n.key}))).subscribe((function(n){r.updateClipPath(),t()}));return function(){return n.unsubscribe()}}},updateClipPath:function(){var n=r.gm.d,t=n.holesWithDoors,e=n.hullOutline,o=n.pngRect,a=[r.currentHoleId].concat(r.getAdjacentHoleIds()).map((function(n){return t[n]})),i=l.LA.cutOut(a,[e]).map((function(n){return n.translate(-o.x,-o.y)})).map((function(n){return"".concat(n.svgPath)})).join(" ");r.clipPath="path('".concat(i,"')")},updateObservableDoors:function(){var n=r.gm.d.roomGraph,t=n.nodesArray[r.currentHoleId],e=n.getAdjacentDoors([t]);this.doorsApi.setObservableDoors(e.map((function(n){return n.doorIndex})))}}}),[e],{equality:{currentHoleId:!0}});return e?(0,v.BX)(g.Z,{stageKey:"nav-demo-1",dark:!0,className:N(e),children:[(0,v.tZ)("img",{className:"geomorph",src:(0,d.qX)(n.layoutKey),draggable:!1,width:e.d.pngRect.width,height:e.d.pngRect.height}),(0,v.tZ)(x,{gm:e,onLoad:function(n){return r.npcsApi=n},disabled:n.disabled}),(0,v.tZ)("img",{className:"geomorph-dark",src:(0,d.qX)(n.layoutKey),draggable:!1,width:e.d.pngRect.width,height:e.d.pngRect.height,style:{clipPath:r.clipPath}}),(0,v.tZ)(h.Z,{gm:e,wire:r.wire,onLoad:function(n){return r.doorsApi=n}})]}):null}var N=function(n){return(0,a.iv)(A||(A=(0,o.Z)(["\n  img {\n    position: absolute;\n    left: ","px;\n    top: ","px;\n  }\n  img.geomorph {\n    filter: brightness(80%);\n  }\n  img.geomorph-dark {\n    filter: invert(100%) brightness(55%) contrast(200%) sepia(0%);\n  }\n"])),n.d.pngRect.x,n.d.pngRect.y)}},43260:function(n,t,e){e.r(t),e.d(t,{default:function(){return d}});var r,o=e(52209),a=e(94184),i=e.n(a),s=e(88269),c=e(8311);function d(n){return(0,c.BX)("div",{className:i()(u,"idle",{disabled:n.disabled}),ref:function(n){if(n){var t=n.children[1],e=function(){n.classList.toggle("idle"),n.classList.toggle("walk")};t.addEventListener("pointerdown",e),t.addEventListener("pointerup",e)}},children:[(0,c.tZ)("div",{className:"shadow"}),(0,c.tZ)("div",{className:"body"})]})}var l=256,u=(0,s.iv)(r||(r=(0,o.Z)(["\n  .body {\n    cursor: pointer;\n    position: absolute;\n    width: ","px;\n    height: ","px;\n    left: ","px;\n    top: ","px;\n    transform: scale(0.18);\n    pointer-events: all;\n    filter: contrast(200%);\n  }\n  \n  &.walk .body {\n    animation: walk 1s steps(",") infinite;\n    background: url('/pics/spritesheet-walk-test-2.png');\n  }\n  &.idle .body {\n    animation: idle 2s steps(",") infinite;\n    background: url('/pics/spritesheet-idle-test-2.png');\n  }\n\n  &.disabled .body {\n    animation-play-state: paused;\n  }\n\n  @keyframes walk {\n    from { background-position: 0px; }\n    to { background-position: ","px; }\n  }\n  @keyframes idle {\n    from { background-position: 0px; }\n    to { background-position: ","px; }\n  }\n\n  .shadow {\n    position: absolute;\n    left: ","px;\n    top: ","px;\n    border-radius: ","px;\n    border: ","px solid rgba(0, 0, 0, 0.25);\n    pointer-events: none;\n  }\n  &.walk .shadow {\n    transform: scale(1.2);\n  }\n"])),l,l,-128,-128,16,13,-4096,-3328,-9,-9,9,9)}}]);