"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9496],{9496:function(t,e,r){r.r(e),r.d(e,{default:function(){return C}});var n,o=r(52209),c=r(92809),i=r(88269),a=r(24790),u=r(35490),s=r(91441),l=r(49345),f=r(35650),p=r(21225),d=r(83159),h=r(59748),g=r(8311);function y(t){var e=t.json,r=(0,f.Z)((function(){return{api:{evt:new a.x},onClick:function(e){var r=e.target,n=r.classList.toggle("open");t.wire.next({key:n?"opened-door":"closed-door",index:Number(r.getAttribute("data-index"))})}}}));return(0,g.tZ)("g",{className:b,onPointerUp:r.onClick,children:e.doors.map((function(t,e){var r=t.rect,n=t.angle;return(0,g.tZ)("rect",{"data-index":e,className:"door",x:r.x,y:r.y,width:r.width,height:r.height,style:{transform:"rotate(".concat(n,"rad)"),transformOrigin:"".concat(r.x,"px ").concat(r.y,"px")}},e)}))})}var b=(0,i.iv)(n||(n=(0,o.Z)(["\n  rect.door {\n    cursor: pointer;\n    fill: #000;\n    stroke: black;\n    opacity: 1;\n    transition: opacity 100ms linear;\n    &.open {\n      opacity: 0;\n    }\n  }\n"]))),v=r(48103),O=r(68451),w=r(27375);function m(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function j(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?m(Object(r),!0).forEach((function(e){(0,c.Z)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):m(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function P(t){var e=(0,w.Z)(),r=(0,f.Z)((function(){return{lights:[],doors:{},computeLights:function(t){var e=t.json,n=t.lights,o=v.LA.from(e.hull.poly[0]).removeHoles(),c=e.walls.concat(e.doors.filter((function(t,e){return"open"!==r.doors[e]})).map((function(t){return t.poly}))).map((function(t){return v.LA.from(t)})).flatMap((function(t){return O.J.triangulationToPolys(t.fastTriangulate())})),i=n.filter((function(t){return o.contains(t.p)}));r.lights=i.map((function(t){var e=t.p.clone(),r=O.J.lightPolygon(e,t.d,c),n=r.rect,o=new v.dl((e.x-n.x)/n.width,(e.y-n.y)/n.height),i=n.width>=n.height?new v.dl(1,n.width/n.height):new v.dl(n.height/n.width,1),a=t.d/(Math.max(n.width,n.height)/2)*.5;return{position:e,poly:r,ratio:o,dist:t.d,scale:i,r:a}}))}}}));return h.default.useEffect((function(){r.computeLights(t);var n=t.wire.subscribe((function(n){switch(n.key){case"opened-door":r.doors[n.index]="open",r.computeLights(t),e();break;case"closed-door":r.doors[n.index]="closed",r.computeLights(t),e()}}));return function(){return n.unsubscribe()}}),[t.lights]),(0,g.BX)(g.HY,{children:[(0,g.BX)("defs",{children:[r.lights.map((function(t,e){var r=t.ratio,n=t.scale,o=t.r;return(0,g.BX)("radialGradient",{id:"my-radial-".concat(e),cx:r.x,cy:r.y,r:o,gradientTransform:"translate(".concat(r.x,", ").concat(r.y,") scale(").concat(n.x,", ").concat(n.y,") translate(").concat(-r.x,", ").concat(-r.y,")"),children:[(0,g.tZ)("stop",{offset:"0%","stop-color":"#aaa"}),(0,g.tZ)("stop",{offset:"80%","stop-color":"#000"}),(0,g.tZ)("stop",{offset:"100%","stop-color":"#000"})]})})),(0,g.BX)("mask",{id:"lights-mask",children:[(0,g.tZ)("rect",j(j({},t.json.pngRect),{},{fill:"#000"})),r.lights.map((function(t,e){var r=t.poly;return(0,g.tZ)("path",{d:r.svgPath,fill:"url(#my-radial-".concat(e,")")})})),(0,g.tZ)("circle",{cx:"50",cy:"50",r:"50",fill:"url(#my-radial)"})]})]}),(0,g.tZ)("image",j(j({},t.json.pngRect),{},{className:"geomorph-light",href:(0,s.qX)(t.json.key),mask:"url(#lights-mask)"})),r.lights.map((function(t){var e=t.position;t.poly;return(0,g.tZ)(g.HY,{children:(0,g.tZ)("image",{href:"/icon/Simple_Icon_Eye.svg",width:"20",height:"20",x:e.x-10,y:e.y-10})})}))]})}var Z,x=r(30266),k=r(809),E=r.n(k),D=r(88767),S=r(84175);function _(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function L(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?_(Object(r),!0).forEach((function(e){(0,c.Z)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):_(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function N(t){var e=(0,D.useQuery)("Image:".concat(t.href,"(").concat(t.darkness||0,")"),(0,x.Z)(E().mark((function e(){var r,n,o,c;return E().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=new Image,n=document.createElement("canvas"),e.next=4,new Promise((function(e,n){r.src=t.href,r.onload=function(){return e(r)},r.onerror=function(){return n(new Error("failed to load image: ".concat(t.href)))}}));case 4:return o=[r.width,r.height],n.width=o[0],n.height=o[1],(c=(0,S.C)(n.getContext("2d"))).drawImage(r,0,0),c.fillStyle="rgba(0, 0, 0, 0.8)",c.fillRect(0,0,n.width,n.height),e.abrupt("return",n.toDataURL());case 12:case"end":return e.stop()}}),e)})))).data;return(0,g.tZ)("image",L(L({},t),{},{href:e}))}function I(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function B(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?I(Object(r),!0).forEach((function(e){(0,c.Z)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):I(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function C(t){var e=(0,p.Z)(X).data,r=(0,f.Z)((function(){return{lights:[{p:new l.d(205,385),d:100},{p:new l.d(620,315),d:250}],wire:new a.x}}),{lights:function(t,e){return t.every((function(t,r){var n=t.p,o=t.d;return n.equals(e[r].p)&&o===e[r].d}))}});return(0,g.tZ)(d.Z,{dark:!0,gridBounds:u.l,initViewBox:u.r,maxZoom:6,className:R,children:e&&(0,g.BX)(g.HY,{children:[(0,g.tZ)(N,B(B({},e.pngRect),{},{className:"geomorph",href:(0,s.qX)(X)})),(0,g.tZ)(P,{json:e,lights:r.lights,wire:r.wire}),(0,g.tZ)(y,{json:e,wire:r.wire})]})})}var X="g-301--bridge",R=(0,i.iv)(Z||(Z=(0,o.Z)(["\n  path.shadow {\n    fill: #00000066;\n    pointer-events: none;\n  }\n"])))},21225:function(t,e,r){r.d(e,{Z:function(){return p}});var n=r(92809),o=r(30266),c=r(809),i=r.n(c),a=r(88767),u=r(18264),s=r(91441);function l(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function f(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?l(Object(r),!0).forEach((function(e){(0,n.Z)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function p(t){return(0,a.useQuery)((0,s.tU)(t),(0,o.Z)(i().mark((function e(){var r;return i().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch((0,s.tU)(t)).then((function(t){return t.json()}));case 2:return r=e.sent,e.abrupt("return",f(f({},r),{},{d:{navPoly:r.navPoly.map(u.L.from)}}));case 4:case"end":return e.stop()}}),e)}))),{keepPreviousData:!0,cacheTime:1/0})}},35650:function(t,e,r){r.d(e,{Z:function(){return c}});var n=r(79056),o=r(59748);function c(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=o.default.useState(t),c=(0,n.Z)(r,1),i=c[0];return o.default.useEffect((function(){var r=t.toString()!==i._prevFn;if(i._prevFn){if(r){for(var o=t(),c=0,a=Object.entries(o);c<a.length;c++){var u,s=(0,n.Z)(a[c],2),l=s[0],f=s[1];"function"===typeof f?i[l]=f:l in i?i._prevInit&&!1===(null===(u=e[l])||void 0===u?void 0:u.call(e,i._prevInit[l],o[l]))&&(i[l]=o[l]):i[l]=f}for(var p=0,d=Object.entries(i);p<d.length;p++){var h=(0,n.Z)(d[p],2),g=h[0];h[1];g in o||delete i[g]}i._prevFn=t.toString(),i._prevInit=o}}else i._prevFn=t.toString(),i._prevInit=t()}),[]),i}},84175:function(t,e,r){function n(t,e){if(void 0===t)throw new Error("Encountered unexpected undefined value".concat(e?" for '".concat(e,"'"):""));return t}function o(t,e){if(null==t)throw new Error("Encountered unexpected null or undefined value".concat(e?" for '".concat(e,"'"):""));return t}r.d(e,{N:function(){return n},C:function(){return o}})}}]);