"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3],{80003:function(t,e,n){n.r(e);var r,o,a=n(52209),c=n(92809),l=n(79056),i=n(59748),s=n(88269),u=n(94184),p=n.n(u),f=n(8935),d=n(35490),g=n(48103),h=n(50269),y=n(83159),b=n(91441),m=n(95814),v=n(8311);function w(t,e){var n="undefined"!==typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!n){if(Array.isArray(t)||(n=function(t,e){if(!t)return;if("string"===typeof t)return x(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return x(t,e)}(t))||e&&t&&"number"===typeof t.length){n&&(t=n);var r=0,o=function(){};return{s:o,n:function(){return r>=t.length?{done:!0}:{done:!1,value:t[r++]}},e:function(t){throw t},f:o}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,c=!0,l=!1;return{s:function(){n=n.call(t)},n:function(){var t=n.next();return c=t.done,t},e:function(t){l=!0,a=t},f:function(){try{c||null==n.return||n.return()}finally{if(l)throw a}}}}function x(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,r=new Array(e);n<e;n++)r[n]=t[n];return r}function O(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function Z(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?O(Object(n),!0).forEach((function(e){(0,c.Z)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):O(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}e.default=(0,f.withSize)({refreshMode:"debounce"})((function(t){var e=(0,m.Z)(t.layoutKey).data,n=i.default.useState((function(){return{root3d:{},eye:{},svg:{},onUpdate:function(t){var e=t.viewBox.baseVal.height,n=d.r.height/e,o=r.root3d,a=r.eye;if(o){o.style.perspective="".concat(100+500/n,"px");var c=a.getBoundingClientRect(),l=(0,h.zk)({clientX:c.x,clientY:c.y,ownerSvg:t,pointerId:null});o.style.perspectiveOrigin="".concat(l.x,"px ").concat(l.y,"px")}}}})),r=(0,l.Z)(n,1)[0];return(0,v.BX)(S,{children:[(0,v.tZ)(y.Z,{gridBounds:d.l,initViewBox:d.r,maxZoom:6,onUpdate:r.onUpdate,dark:!0,children:e&&!t.disabled&&(0,v.BX)("g",{ref:function(t){t&&(r.root3d=t.querySelector(".root-3d"),r.svg=t.ownerSVGElement,setTimeout((function(){return r.onUpdate(t.ownerSVGElement)})))},children:[(0,v.tZ)("image",Z(Z({},e.d.pngRect),{},{href:(0,b.qX)(t.layoutKey)})),(0,v.tZ)(j,{gm:e})]})}),(0,v.tZ)("div",{className:"eye",ref:function(t){return t&&(r.eye=t)}})]})}));var S=(0,s.zo)("div")(r||(r=(0,a.Z)(["\n  height: 100%;\n  > .eye {\n    position: absolute;\n    width: 2px;\n    height: 2px;\n    top: calc(50% - 1px);\n    left: calc(50% - 1px);\n    background: red;\n    pointer-events: none;\n  }\n"])));function j(t){var e=t.gm,n=function(t){return i.default.useMemo((function(){var e=document.createElement("canvas"),n=e.getContext("2d"),r=[t.d.pngRect.width,t.d.pngRect.height];e.width=r[0],e.height=r[1],n.translate(-t.d.pngRect.x,-t.d.pngRect.y);var o=t.groups.walls;n.fillStyle=U,(0,h.Fx)(n,o);var a=e.toDataURL();n.clearRect(0,0,e.width,e.height);var c=t.groups.obstacles;n.fillStyle=D,(0,h.Fx)(n,c);var l=e.toDataURL();n.clearRect(0,0,e.width,e.height),n.font=b.Dv.font,n.textBaseline="top";var i,s=w(t.labels);try{for(s.s();!(i=s.n()).done;){var u=i.value,p=u.text,f=u.rect,d=u.padded;n.fillStyle="#000",n.fillRect(d.x,d.y,d.width,d.height),n.fillStyle="#fff",n.fillText(p,f.x,f.y)}}catch(g){s.e(g)}finally{s.f()}return{wallsDataUrl:a,obstaclesDataUrl:l,labelsDataUrl:e.toDataURL()}}),[t.groups.walls])}(e),r=n.wallsDataUrl,o=n.obstaclesDataUrl,a=n.labelsDataUrl,c=i.default.useMemo((function(){return{wallSegs:e.groups.walls.flatMap((function(t){return t.translate(-e.d.pngRect.x,-e.d.pngRect.y).lineSegs})),doorSegs:e.doors.map((function(t){var n=(0,l.Z)(t.seg,2);return[n[0],n[1]].map((function(t){return g.dl.from(t).translate(-e.d.pngRect.x,-e.d.pngRect.y)}))})),obstacleSegs:e.groups.obstacles.flatMap((function(t){return t.translate(-e.d.pngRect.x,-e.d.pngRect.y).lineSegs}))}}),[e.groups.walls]),s=c.wallSegs,u=c.doorSegs,f=c.obstacleSegs;return(0,v.tZ)("foreignObject",Z(Z({xmlns:"http://www.w3.org/1999/xhtml"},e.d.pngRect),{},{children:(0,v.BX)("div",{className:p()("root-3d",N),children:[s.map((function(t,e){var n=(0,l.Z)(t,2),r=n[0],o=n[1];return R.copy(o).sub(r),(0,v.tZ)("div",{className:"wall",style:{transform:"translate3d(".concat(r.x,"px, ").concat(r.y,"px, 0px) rotateZ(").concat(R.angle,"rad) rotateX(90deg)"),width:R.length}},"wall-".concat(e))})),f.map((function(t,e){var n=(0,l.Z)(t,2),r=n[0],o=n[1];return R.copy(o).sub(r),(0,v.tZ)("div",{className:"obstacle",style:{transform:"translate3d(".concat(r.x,"px, ").concat(r.y,"px, 0px) rotateZ(").concat(R.angle,"rad) rotateX(90deg)"),width:R.length}},"obstacle-".concat(e))})),u.map((function(t,e){var n=(0,l.Z)(t,2),r=n[0],o=n[1];return R.copy(r).sub(o),(0,v.tZ)("div",{className:"door",style:{transform:"translate3d(".concat(o.x,"px, ").concat(o.y,"px, 0px) rotateZ(").concat(R.angle,"rad) rotateX(90deg)"),width:R.length}},"door-".concat(e))})),(0,v.tZ)("img",{src:r,className:"wall-tops"}),(0,v.tZ)("img",{src:o,className:"obstacle-tops"}),(0,v.tZ)("img",{src:a,className:"labels"})]})}))}var R=g.dl.zero,D="#666",P="#444",U="#222",k="#000",E="#444",N=(0,s.iv)(o||(o=(0,a.Z)(["\n  pointer-events: none;\n  transform-style: preserve-3d;\n  \n  .door {\n    position: absolute;\n    transform-origin: top left;\n    height: ","px;\n    background: ",";\n  }\n  .obstacle {\n    position: absolute;\n    transform-origin: top left;\n    height: ","px;\n    background: ",";\n    backface-visibility: hidden;\n  }\n  .wall {\n    position: absolute;\n    transform-origin: top left;\n    height: ","px;\n    background: ",";\n    backface-visibility: hidden;\n  }\n  .obstacle-tops {\n    position: absolute;\n    transform-origin: top left;\n    transform: translateZ(","px);\n  }\n  .labels, .wall-tops {\n    position: absolute;\n    transform-origin: top left;\n    transform: translateZ(","px);\n  }\n"])),150,E,75,P,150,k,75,150)},95814:function(t,e,n){n.d(e,{Z:function(){return h}});var r=n(92809),o=n(97131),a=n(30266),c=n(809),l=n.n(c),i=n(88767),s=n(91441),u=n(48103),p=n(49082),f=n(20720);function d(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function g(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?d(Object(n),!0).forEach((function(e){(0,r.Z)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):d(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function h(t,e){return(0,i.useQuery)((0,s.tU)(t),(0,a.Z)(l().mark((function e(){var n,r,a,c,i,d;return l().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch((0,s.tU)(t)).then((function(t){return t.json()})).then(p.Vn);case 2:return n=e.sent,r=f.G.fromJson(n.roomGraph),a=r.nodesArray.filter((function(t){return"room"===t.type})).map((function(t,e){var a=r.getEdgesFrom(t).flatMap((function(t){var e=t.dst;return"door"===e.type?n.doors[e.doorIndex].poly:[]}));return u.LA.union([n.holes[e]].concat((0,o.Z)(a)))[0]})),c=n.groups.singles.filter((function(t){return t.tags.includes("switch")})).map((function(t){return t.poly.center})),i=n.groups.singles.filter((function(t){return t.tags.includes("spawn")})).map((function(t){return t.poly.center})),d=g(g({},n),{},{d:{hullOutline:n.hullPoly[0].removeHoles(),pngRect:u.UL.fromJson(n.items[0].pngRect),roomGraph:r,holesWithDoors:a,holeSwitches:n.holes.map((function(t){return c.find((function(e){return t.contains(e)}))||t.rect.center})),spawnPoints:i}}),e.abrupt("return",d);case 9:case"end":return e.stop()}}),e)}))),g({cacheTime:1/0},e))}}}]);