"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[39],{61039:function(t,e,n){n.r(e),n.d(e,{default:function(){return v}});var r,a=n(52209),o=n(79056),c=n(92809),s=n(30266),l=n(809),i=n.n(l),u=n(59748),p=n(88767),f=n(88269),g=n(43350),d=n(48103),b=n(84273),m=n(83159),h=n(8311);function y(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function w(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?y(Object(n),!0).forEach((function(e){(0,c.Z)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):y(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function v(t){var e=(0,p.useQuery)("".concat(t.layoutKey,"-json"),(0,s.Z)(i().mark((function e(){return i().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",fetch("/geomorph/".concat(t.layoutKey,".json")).then((function(t){return t.json()})));case 1:case"end":return e.stop()}}),e)})))).data;return(0,h.tZ)(m.Z,{gridBounds:g.l,initViewBox:g.r,maxZoom:6,children:e&&(0,h.BX)(h.HY,{children:[(0,h.tZ)("image",w(w({},e.pngRect),{},{href:"/geomorph/".concat(t.layoutKey,".png")})),(0,h.tZ)(x,{gm:e})]})})}function x(t){var e=t.gm,n=function(){var t=(0,u.useRef)(null);return(0,u.useEffect)((function(){var e;if(null!==(e=t.current)&&void 0!==e&&e.ownerSVGElement){var n=t.current.ownerSVGElement,r=Array.from(t.current.children)[0],a=function(){var t=n.viewBox.baseVal,e=t.x,a=t.width,o=t.y,c=t.height;r.style.perspective="1000px",r.style.perspectiveOrigin="".concat(e+.5*a,"px ").concat(o+.5*c,"px")};a(),new MutationObserver((function(t){return t.forEach((function(t){return"attributes"===t.type&&"viewBox"===t.attributeName&&a()}))})).observe(n,{attributes:!0})}}),[]),t}(),r=function(t){return u.default.useMemo((function(){var e=document.createElement("canvas"),n=e.getContext("2d"),r=[t.pngRect.width,t.pngRect.height];e.width=r[0],e.height=r[1],n.translate(-t.pngRect.x,-t.pngRect.y);var a=t.walls.map((function(t){return d.LA.from(t)}));n.fillStyle="#c00",(0,b.Fx)(n,a);var o=e.toDataURL();n.clearRect(0,0,e.width,e.height);var c=t.obstacles.map((function(t){return d.LA.from(t)}));return n.fillStyle="rgba(0, 255, 0, 0.6)",(0,b.Fx)(n,c),{wallsDataUrl:o,obstaclesDataUrl:e.toDataURL()}}),[t.walls])}(e),a=r.wallsDataUrl,c=r.obstaclesDataUrl,s=u.default.useMemo((function(){return{wallSegs:e.walls.flatMap((function(t){return d.LA.from(t).translate(-e.pngRect.x,-e.pngRect.y).lineSegs})),doorSegs:e.doors.map((function(t){var n=(0,o.Z)(t.seg,2);return[n[0],n[1]].map((function(t){return d.dl.from(t).translate(-e.pngRect.x,-e.pngRect.y)}))})),obstacleSegs:e.obstacles.flatMap((function(t){return d.LA.from(t).translate(-e.pngRect.x,-e.pngRect.y).lineSegs}))}}),[e.walls]),l=s.wallSegs,i=s.doorSegs,p=s.obstacleSegs;return(0,h.tZ)("foreignObject",w(w({ref:n,xmlns:"http://www.w3.org/1999/xhtml"},e.pngRect),{},{children:(0,h.BX)("div",{className:O,children:[l.map((function(t,e){var n=(0,o.Z)(t,2),r=n[0],a=n[1];return Z.copy(a).sub(r),(0,h.tZ)("div",{className:"wall",style:{transform:"translate3d(".concat(r.x,"px, ").concat(r.y,"px, 0px) rotateZ(").concat(Z.angle,"rad) rotateX(90deg)"),width:Z.length}},"wall-".concat(e))})),p.map((function(t,e){var n=(0,o.Z)(t,2),r=n[0],a=n[1];return Z.copy(a).sub(r),(0,h.tZ)("div",{className:"obstacle",style:{transform:"translate3d(".concat(r.x,"px, ").concat(r.y,"px, 0px) rotateZ(").concat(Z.angle,"rad) rotateX(90deg)"),width:Z.length}},"obstacle-".concat(e))})),i.map((function(t,e){var n=(0,o.Z)(t,2),r=n[0],a=n[1];return Z.copy(r).sub(a),(0,h.tZ)("div",{className:"door",style:{transform:"translate3d(".concat(a.x,"px, ").concat(a.y,"px, 0px) rotateZ(").concat(Z.angle,"rad) rotateX(90deg)"),width:Z.length}},"door-".concat(e))})),(0,h.tZ)("img",{src:a,className:"wall-tops"}),(0,h.tZ)("img",{src:c,className:"obstacle-tops"})]})}))}var Z=d.dl.zero,O=(0,f.iv)(r||(r=(0,a.Z)(["\n  pointer-events: none;\n  transform-style: preserve-3d;\n  \n  .wall {\n    position: absolute;\n    transform-origin: top left;\n    height: ","px;\n    background: #900;\n    backface-visibility: hidden;\n  }\n  .obstacle {\n    position: absolute;\n    transform-origin: top left;\n    height: ","px;\n    background: rgba(0, 200, 0, 0.6);\n    backface-visibility: hidden;\n  }\n  .wall-tops {\n    position: absolute;\n    transform-origin: top left;\n    transform: translateZ(","px);\n  }\n  .obstacle-tops {\n    position: absolute;\n    transform-origin: top left;\n    transform: translateZ(","px);\n  }\n  .door {\n    position: absolute;\n    transform-origin: top left;\n    height: ","px;\n    background: #500;\n  }\n"])),200,100,200,100,200)}}]);