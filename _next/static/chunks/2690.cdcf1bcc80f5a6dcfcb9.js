"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2690],{92690:function(t,e,r){r.r(e),r.d(e,{default:function(){return D}});var n=r(52209),o=r(92809),i=r(88269),c=r(35490),a=r(91441),u=r(49345),s=r(35650),f=r(21225),p=r(83159),l=r(59748),g=r(48103),h=r(68451),d=r(8311);function y(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function b(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?y(Object(r),!0).forEach((function(e){(0,o.Z)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):y(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function O(t){var e=(0,s.Z)((function(){var r=t.json;return{dark:new g.LA,lights:[],computeLights:function(t){var n=g.LA.from(r.hull.poly[0]).removeHoles(),o=r.walls.map((function(t){return g.LA.from(t)})).flatMap((function(t){return h.J.triangulationToPolys(t.fastTriangulate())})),i=t.filter((function(t){return n.contains(t.p)}));e.lights=i.map((function(t){var e=t.p.clone(),r=h.J.lightPolygon(e,t.d,o),n=r.rect;return{position:e,poly:r,ratio:new g.dl((e.x-n.x)/n.width,(e.y-n.y)/n.height)}})),e.dark=g.LA.cutOut(e.lights.map((function(t){return t.poly})),[n])[0]}}}));return l.default.useEffect((function(){e.computeLights(t.lights)}),[t.lights]),(0,d.BX)(d.HY,{children:[(0,d.BX)("defs",{children:[e.lights.map((function(t,e){return(0,d.BX)("radialGradient",{id:"my-radial-".concat(e),fx:t.ratio.x,fy:t.ratio.y,r:"100%",children:[(0,d.tZ)("stop",{offset:"0%","stop-color":"#bbb"}),(0,d.tZ)("stop",{offset:"60%","stop-color":"#000"}),(0,d.tZ)("stop",{offset:"100%","stop-color":"#000"})]})})),(0,d.BX)("mask",{id:"my-funky-mask",children:[(0,d.tZ)("rect",b(b({},t.json.pngRect),{},{fill:"#000"})),e.lights.map((function(t,e){var r=t.poly;return(0,d.tZ)("path",{d:r.svgPath,fill:"url(#my-radial-".concat(e,")")})})),(0,d.tZ)("circle",{cx:"50",cy:"50",r:"50",fill:"url(#my-radial)"})]})]}),(0,d.tZ)("image",b(b({},t.json.pngRect),{},{href:(0,a.qX)(t.json.key),mask:"url(#my-funky-mask)"})),t.lights.map((function(t){var e=t.p;return(0,d.tZ)("image",{href:"/icon/Simple_Icon_Eye.svg",width:"20",height:"20",x:e.x-10,y:e.y-10})}))]})}var v;function m(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function j(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?m(Object(r),!0).forEach((function(e){(0,o.Z)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):m(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function w(t){var e=t.json;return(0,d.tZ)("foreignObject",j(j({},e.pngRect),{},{xmlns:"http://www.w3.org/1999/xhtml",className:Z,children:(0,d.tZ)("div",{onPointerUp:function(t){var r=t.target,n=[r.clientWidth,Number(r.getAttribute("data-index"))],o=n[1],i=n[0]<=10?e.doors[o].rect.width:10;r.style.width="".concat(i,"px")},children:e.doors.map((function(t,r){var n=t.rect,o=t.angle;return(0,d.tZ)("div",{className:"door","data-index":r,style:{left:n.x-e.pngRect.x,top:n.y-e.pngRect.y,width:n.width,height:n.height,transformOrigin:"top left",transform:"rotate(".concat(o,"rad)")}})}))})}))}var P,Z=(0,i.iv)(v||(v=(0,n.Z)(["\n  div.door {\n    position: absolute;\n    cursor: pointer;\n    background: ",";\n    border: 1px solid black;\n\n    transition: width 100ms ease-in;\n    &.open {\n      width: 0;\n    }\n  }\n"])),"#000");function k(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function x(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?k(Object(r),!0).forEach((function(e){(0,o.Z)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):k(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function D(t){var e=(0,f.Z)(_).data,r=(0,s.Z)((function(){return{lights:[{p:new u.d(205,385),d:150},{p:new u.d(620,315),d:250}]}}),{lights:function(t,e){return t.every((function(t,r){var n=t.p,o=t.d;return n.equals(e[r].p)&&o===e[r].d}))}});return(0,d.tZ)(p.Z,{dark:!0,gridBounds:c.l,initViewBox:c.r,maxZoom:6,className:E,children:e&&(0,d.BX)(d.HY,{children:[(0,d.tZ)("image",x(x({},e.pngRect),{},{className:"geomorph",href:(0,a.qX)(_)})),(0,d.tZ)(O,{json:e,lights:r.lights}),(0,d.tZ)(w,{json:e})]})})}var _="g-301--bridge",E=(0,i.iv)(P||(P=(0,n.Z)(["\n  image.geomorph {\n    filter: brightness(20%) contrast(100%);\n  }\n  path.shadow {\n    fill: #00000066;\n    pointer-events: none;\n  }\n"])))},21225:function(t,e,r){r.d(e,{Z:function(){return l}});var n=r(92809),o=r(30266),i=r(809),c=r.n(i),a=r(88767),u=r(18264),s=r(91441);function f(t,e){var r=Object.keys(t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(t);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),r.push.apply(r,n)}return r}function p(t){for(var e=1;e<arguments.length;e++){var r=null!=arguments[e]?arguments[e]:{};e%2?f(Object(r),!0).forEach((function(e){(0,n.Z)(t,e,r[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(r)):f(Object(r)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(r,e))}))}return t}function l(t){return(0,a.useQuery)((0,s.tU)(t),(0,o.Z)(c().mark((function e(){var r;return c().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch((0,s.tU)(t)).then((function(t){return t.json()}));case 2:return r=e.sent,e.abrupt("return",p(p({},r),{},{d:{navPoly:r.navPoly.map(u.L.from)}}));case 4:case"end":return e.stop()}}),e)}))),{keepPreviousData:!0,cacheTime:1/0})}},35650:function(t,e,r){r.d(e,{Z:function(){return i}});var n=r(79056),o=r(59748);function i(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=o.default.useState(t),i=(0,n.Z)(r,1),c=i[0];return o.default.useEffect((function(){var r=t.toString()!==c._prevFn;if(c._prevFn){if(r){for(var o=t(),i=0,a=Object.entries(o);i<a.length;i++){var u,s=(0,n.Z)(a[i],2),f=s[0],p=s[1];"function"===typeof p?c[f]=p:f in c?c._prevInit&&!1===(null===(u=e[f])||void 0===u?void 0:u.call(e,c._prevInit[f],o[f]))&&(c[f]=o[f]):c[f]=p}for(var l=0,g=Object.entries(c);l<g.length;l++){var h=(0,n.Z)(g[l],2),d=h[0];h[1];d in o||delete c[d]}c._prevFn=t.toString(),c._prevInit=o}}else c._prevFn=t.toString(),c._prevInit=t()}),[]),c}}}]);